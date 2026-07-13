import { PILOT_OBJECT_ID, pilotRoleSchema, type PilotRole } from "./pilot-domain";

export interface PilotIdentity {
  userId: string;
  displayName: string;
  role: PilotRole;
  objectIds: readonly string[];
}

function splitHeader(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * These headers are written by the trusted SSO reverse proxy. The application
 * must be reachable only through that proxy; direct access to the app port is
 * forbidden by the deployment configuration.
 */
export function getPilotIdentity(request: Request): PilotIdentity | null {
  if (request.headers.get("x-atlas-authenticated") !== "true") return null;

  const userId = request.headers.get("x-atlas-user")?.trim();
  const role = splitHeader(request.headers.get("x-atlas-roles"))
    .map((value) => pilotRoleSchema.safeParse(value))
    .find((result) => result.success)?.data;
  const objectIds = splitHeader(request.headers.get("x-atlas-objects"));

  if (!userId || userId.length > 160 || !role || !objectIds.includes(PILOT_OBJECT_ID)) return null;

  const displayName = request.headers.get("x-atlas-display-name")?.trim() || userId;

  return { userId, displayName, role, objectIds };
}

export function requirePilotIdentity(request: Request): PilotIdentity {
  const identity = getPilotIdentity(request);
  if (!identity) throw new Error("ATLAS_AUTH_REQUIRED");
  return identity;
}
