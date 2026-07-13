import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

export function hasDatabaseConfig(): boolean {
  return Boolean(process.env.ATLAS_DATABASE_URL);
}

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.ATLAS_DATABASE_URL;
  if (!databaseUrl) throw new Error("ATLAS_DATABASE_NOT_CONFIGURED");
  return databaseUrl;
}

/** Validates internal producer requests without accepting browser credentials. */
export function verifyIngestSignature(request: Request, rawBody: string): boolean {
  const secret = process.env.ATLAS_INGEST_HMAC_SECRET;
  const timestampHeader = request.headers.get("x-atlas-timestamp");
  const signatureHeader = request.headers.get("x-atlas-signature");
  const timestampSeconds = Number(timestampHeader);

  if (
    !secret ||
    secret.length < 32 ||
    !signatureHeader ||
    !Number.isSafeInteger(timestampSeconds)
  ) {
    return false;
  }

  const timestampMs = timestampSeconds * 1000;
  if (Math.abs(Date.now() - timestampMs) > MAX_SIGNATURE_AGE_MS) return false;

  const expected = createHmac("sha256", secret).update(`${timestampHeader}.${rawBody}`).digest();
  const received = Buffer.from(signatureHeader, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
