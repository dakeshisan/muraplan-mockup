import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { requirePilotIdentity } from "./server/pilot-auth.server";
import { hasDatabaseConfig } from "./server/pilot-config.server";
import { listAuraFinanceCases } from "./server/pilot-db.server";

export const getPilotFinanceCases = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "private, no-store");
  const identity = requirePilotIdentity(getRequest());
  if (!hasDatabaseConfig()) {
    return {
      identity,
      cases: [],
      sourceStatus: "not_configured" as const,
    };
  }

  try {
    return {
      identity,
      cases: await listAuraFinanceCases(),
      sourceStatus: "ready" as const,
    };
  } catch {
    return {
      identity,
      cases: [],
      sourceStatus: "unavailable" as const,
    };
  }
});
