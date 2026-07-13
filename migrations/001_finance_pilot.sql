CREATE TABLE IF NOT EXISTS ingest_events (
  event_id UUID PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('sherlock', 'one_c')),
  source_exported_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_cases (
  case_id TEXT PRIMARY KEY,
  object_id TEXT NOT NULL CHECK (object_id = 'aura'),
  contractor TEXT NOT NULL,
  amount_tenge BIGINT NOT NULL CHECK (amount_tenge >= 0),
  bitrix_stage TEXT NOT NULL,
  act_type TEXT NOT NULL,
  act_number TEXT NOT NULL,
  act_date DATE,
  contract_ref TEXT,
  document_count INTEGER NOT NULL CHECK (document_count >= 0),
  document_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  sherlock_severity TEXT NOT NULL CHECK (sherlock_severity IN ('green', 'yellow', 'red')),
  sherlock_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  sherlock_checked_at TIMESTAMPTZ NOT NULL,
  one_c_status TEXT CHECK (one_c_status IN ('clear', 'paid', 'over_limit', 'unknown')),
  one_c_checked_at TIMESTAMPTZ,
  one_c_detail TEXT,
  one_c_exported_at TIMESTAMPTZ,
  source_updated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_cases_aura_updated_idx
  ON payment_cases (object_id, source_updated_at DESC);
