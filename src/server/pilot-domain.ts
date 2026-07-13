import { z } from "zod";

export const PILOT_OBJECT_ID = "aura" as const;

export const pilotRoleSchema = z.enum([
  "owner",
  "finance",
  "construction_director",
  "pto",
  "observer",
]);

export type PilotRole = z.infer<typeof pilotRoleSchema>;

export const sherlockSeveritySchema = z.enum(["green", "yellow", "red"]);
export type SherlockSeverity = z.infer<typeof sherlockSeveritySchema>;

export const oneCStatusSchema = z.enum(["clear", "paid", "over_limit", "unknown"]);
export type OneCStatus = z.infer<typeof oneCStatusSchema>;

const isoDateTime = z.string().datetime({ offset: true });

export const sherlockSnapshotSchema = z
  .object({
    eventId: z.string().uuid(),
    caseId: z.string().min(1).max(80),
    objectId: z.literal(PILOT_OBJECT_ID),
    contractor: z.string().min(1).max(240),
    amountTenge: z.number().int().nonnegative(),
    bitrixStage: z.string().min(1).max(160),
    actType: z.string().min(1).max(48),
    actNumber: z.string().min(1).max(80),
    actDate: z.string().date().nullable(),
    contractRef: z.string().max(160).nullable(),
    documentCount: z.number().int().min(0).max(100),
    documentTypes: z.array(z.string().min(1).max(48)).max(12),
    severity: sherlockSeveritySchema,
    findings: z
      .array(
        z.object({
          ruleId: z.string().min(1).max(40),
          severity: sherlockSeveritySchema,
          detail: z.string().min(1).max(500),
        }),
      )
      .max(30),
    checkedAt: isoDateTime,
    sourceUpdatedAt: isoDateTime,
  })
  .strict();

export type SherlockSnapshot = z.infer<typeof sherlockSnapshotSchema>;

export const oneCImportSchema = z
  .object({
    eventId: z.string().uuid(),
    exportedAt: isoDateTime,
    records: z
      .array(
        z.object({
          caseId: z.string().min(1).max(80),
          status: oneCStatusSchema,
          checkedAt: isoDateTime,
          detail: z.string().max(320).nullable(),
        }),
      )
      .min(1)
      .max(500),
  })
  .strict();

export type OneCImport = z.infer<typeof oneCImportSchema>;

export type Readiness = "blocked" | "review" | "ready";

export function isOneCFresh(checkedAt: string | null, now = new Date()): boolean {
  if (!checkedAt) return false;
  const checkedAtMs = Date.parse(checkedAt);
  const maxAgeMs = 24 * 60 * 60 * 1000;
  return (
    Number.isFinite(checkedAtMs) &&
    checkedAtMs <= now.getTime() &&
    now.getTime() - checkedAtMs <= maxAgeMs
  );
}

export function deriveReadiness(
  input: {
    severity: SherlockSeverity;
    oneCStatus: OneCStatus | null;
    oneCCheckedAt: string | null;
  },
  now = new Date(),
): Readiness {
  if (
    input.severity === "red" ||
    input.oneCStatus === "paid" ||
    input.oneCStatus === "over_limit"
  ) {
    return "blocked";
  }
  if (
    input.severity === "yellow" ||
    input.oneCStatus !== "clear" ||
    !isOneCFresh(input.oneCCheckedAt, now)
  ) {
    return "review";
  }
  return "ready";
}
