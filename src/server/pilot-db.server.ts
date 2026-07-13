import postgres from "postgres";
import {
  deriveReadiness,
  isOneCFresh,
  type OneCImport,
  type OneCStatus,
  type Readiness,
  type SherlockSeverity,
  type SherlockSnapshot,
} from "./pilot-domain";
import { getDatabaseUrl } from "./pilot-config.server";

let sqlClient: ReturnType<typeof postgres> | undefined;

function sql() {
  if (!sqlClient) {
    sqlClient = postgres(getDatabaseUrl(), {
      max: 5,
      idle_timeout: 20,
      prepare: false,
    });
  }
  return sqlClient;
}

type DatabaseCase = {
  caseId: string;
  contractor: string;
  amountTenge: number;
  bitrixStage: string;
  actType: string;
  actNumber: string;
  actDate: string | null;
  contractRef: string | null;
  documentCount: number;
  documentTypes: string[];
  severity: SherlockSeverity;
  findings: Array<{ ruleId: string; severity: SherlockSeverity; detail: string }>;
  checkedAt: string;
  oneCStatus: OneCStatus | null;
  oneCCheckedAt: string | null;
  oneCDetail: string | null;
  sourceUpdatedAt: string;
};

export interface FinanceCase extends DatabaseCase {
  readiness: Readiness;
  oneCFresh: boolean;
}

function asIso(value: Date | string | null): string | null {
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function mapCase(row: Record<string, unknown>): FinanceCase {
  const record: DatabaseCase = {
    caseId: String(row.caseId),
    contractor: String(row.contractor),
    amountTenge: Number(row.amountTenge),
    bitrixStage: String(row.bitrixStage),
    actType: String(row.actType),
    actNumber: String(row.actNumber),
    actDate: asIso(row.actDate as Date | string | null),
    contractRef: row.contractRef ? String(row.contractRef) : null,
    documentCount: Number(row.documentCount),
    documentTypes: Array.isArray(row.documentTypes) ? row.documentTypes.map(String) : [],
    severity: row.severity as SherlockSeverity,
    findings: Array.isArray(row.findings)
      ? row.findings.map((finding) => ({
          ruleId: String((finding as Record<string, unknown>).ruleId),
          severity: (finding as Record<string, unknown>).severity as SherlockSeverity,
          detail: String((finding as Record<string, unknown>).detail),
        }))
      : [],
    checkedAt: String(asIso(row.checkedAt as Date | string)),
    oneCStatus: (row.oneCStatus as OneCStatus | null) ?? null,
    oneCCheckedAt: asIso(row.oneCCheckedAt as Date | string | null),
    oneCDetail: row.oneCDetail ? String(row.oneCDetail) : null,
    sourceUpdatedAt: String(asIso(row.sourceUpdatedAt as Date | string)),
  };
  const readiness = deriveReadiness(record);
  return {
    ...record,
    readiness,
    oneCFresh: isOneCFresh(record.oneCCheckedAt),
  };
}

export async function listAuraFinanceCases(): Promise<FinanceCase[]> {
  const rows = await sql()<Record<string, unknown>[]>`
    SELECT
      case_id AS "caseId",
      contractor,
      amount_tenge AS "amountTenge",
      bitrix_stage AS "bitrixStage",
      act_type AS "actType",
      act_number AS "actNumber",
      act_date AS "actDate",
      contract_ref AS "contractRef",
      document_count AS "documentCount",
      document_types AS "documentTypes",
      sherlock_severity AS severity,
      sherlock_findings AS findings,
      sherlock_checked_at AS "checkedAt",
      one_c_status AS "oneCStatus",
      one_c_checked_at AS "oneCCheckedAt",
      one_c_detail AS "oneCDetail",
      source_updated_at AS "sourceUpdatedAt"
    FROM payment_cases
    WHERE object_id = 'aura'
    ORDER BY source_updated_at DESC, case_id DESC
  `;
  return rows.map(mapCase);
}

export async function ingestSherlockSnapshot(
  snapshot: SherlockSnapshot,
): Promise<{ duplicate: boolean }> {
  return sql().begin(async (tx) => {
    const event = await tx<{ eventId: string }[]>`
      INSERT INTO ingest_events (event_id, source, source_exported_at)
      VALUES (${snapshot.eventId}, 'sherlock', ${snapshot.sourceUpdatedAt})
      ON CONFLICT (event_id) DO NOTHING
      RETURNING event_id AS "eventId"
    `;
    if (event.length === 0) return { duplicate: true };

    await tx`
      INSERT INTO payment_cases (
        case_id, object_id, contractor, amount_tenge, bitrix_stage,
        act_type, act_number, act_date, contract_ref, document_count,
        document_types, sherlock_severity, sherlock_findings,
        sherlock_checked_at, source_updated_at
      ) VALUES (
        ${snapshot.caseId}, 'aura', ${snapshot.contractor}, ${snapshot.amountTenge}, ${snapshot.bitrixStage},
        ${snapshot.actType}, ${snapshot.actNumber}, ${snapshot.actDate}, ${snapshot.contractRef}, ${snapshot.documentCount},
        ${JSON.stringify(snapshot.documentTypes)}::jsonb, ${snapshot.severity}, ${JSON.stringify(snapshot.findings)}::jsonb,
        ${snapshot.checkedAt}, ${snapshot.sourceUpdatedAt}
      )
      ON CONFLICT (case_id) DO UPDATE SET
        contractor = EXCLUDED.contractor,
        amount_tenge = EXCLUDED.amount_tenge,
        bitrix_stage = EXCLUDED.bitrix_stage,
        act_type = EXCLUDED.act_type,
        act_number = EXCLUDED.act_number,
        act_date = EXCLUDED.act_date,
        contract_ref = EXCLUDED.contract_ref,
        document_count = EXCLUDED.document_count,
        document_types = EXCLUDED.document_types,
        sherlock_severity = EXCLUDED.sherlock_severity,
        sherlock_findings = EXCLUDED.sherlock_findings,
        sherlock_checked_at = EXCLUDED.sherlock_checked_at,
        source_updated_at = EXCLUDED.source_updated_at,
        updated_at = now()
      WHERE EXCLUDED.source_updated_at >= payment_cases.source_updated_at
    `;
    return { duplicate: false };
  });
}

export async function ingestOneCImport(
  payload: OneCImport,
): Promise<{ duplicate: boolean; updatedCases: number }> {
  return sql().begin(async (tx) => {
    const event = await tx<{ eventId: string }[]>`
      INSERT INTO ingest_events (event_id, source, source_exported_at)
      VALUES (${payload.eventId}, 'one_c', ${payload.exportedAt})
      ON CONFLICT (event_id) DO NOTHING
      RETURNING event_id AS "eventId"
    `;
    if (event.length === 0) return { duplicate: true, updatedCases: 0 };

    let updatedCases = 0;
    for (const record of payload.records) {
      const result = await tx`
        UPDATE payment_cases
        SET
          one_c_status = ${record.status},
          one_c_checked_at = ${record.checkedAt},
          one_c_detail = ${record.detail},
          one_c_exported_at = ${payload.exportedAt},
          updated_at = now()
        WHERE case_id = ${record.caseId} AND object_id = 'aura'
          AND (one_c_checked_at IS NULL OR one_c_checked_at <= ${record.checkedAt})
      `;
      updatedCases += result.count;
    }
    return { duplicate: false, updatedCases };
  });
}
