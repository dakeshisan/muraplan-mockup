import { describe, expect, test } from "bun:test";
import { getPilotIdentity } from "../src/server/pilot-auth.server";
import { deriveReadiness, isOneCFresh } from "../src/server/pilot-domain";
import { protectPilotRequest } from "../src/server/request-guard.server";

describe("pilot identity", () => {
  test("rejects a request without trusted proxy headers", () => {
    expect(getPilotIdentity(new Request("https://atlas.example/finance"))).toBeNull();
  });

  test("accepts only an Aura-scoped pilot role", () => {
    const request = new Request("https://atlas.example/finance", {
      headers: {
        "x-atlas-authenticated": "true",
        "x-atlas-user": "finance.aura",
        "x-atlas-display-name": "Finance Aura",
        "x-atlas-roles": "finance",
        "x-atlas-objects": "aura",
      },
    });
    expect(getPilotIdentity(request)).toMatchObject({ role: "finance", userId: "finance.aura" });
  });

  test("returns no finance content without SSO and closes prototype routes", () => {
    const anonymousFinance = protectPilotRequest(new Request("https://atlas.example/finance"));
    expect(anonymousFinance?.status).toBe(302);
    expect(anonymousFinance?.headers.get("location")).toBe(
      "https://atlas.example/login?returnTo=%2Ffinance",
    );
    expect(protectPilotRequest(new Request("https://atlas.example/portal/"))?.status).toBe(404);
  });

  test("rejects an authenticated employee without Aura scope", () => {
    const forbidden = protectPilotRequest(
      new Request("https://atlas.example/finance", {
        headers: {
          "x-atlas-authenticated": "true",
          "x-atlas-user": "observer.other-object",
          "x-atlas-roles": "observer",
          "x-atlas-objects": "keruen",
        },
      }),
    );
    expect(forbidden?.status).toBe(403);
  });
});

describe("readiness", () => {
  const now = new Date("2026-07-13T10:00:00.000Z");

  test("does not mark stale 1C data as ready", () => {
    expect(
      deriveReadiness(
        { severity: "green", oneCStatus: "clear", oneCCheckedAt: "2026-07-12T09:59:59.000Z" },
        now,
      ),
    ).toBe("review");
    expect(isOneCFresh("2026-07-12T09:59:59.000Z", now)).toBe(false);
  });

  test("blocks red Sherlock verdicts and completed payments", () => {
    expect(
      deriveReadiness(
        { severity: "red", oneCStatus: "clear", oneCCheckedAt: "2026-07-13T09:00:00.000Z" },
        now,
      ),
    ).toBe("blocked");
    expect(
      deriveReadiness(
        { severity: "green", oneCStatus: "paid", oneCCheckedAt: "2026-07-13T09:00:00.000Z" },
        now,
      ),
    ).toBe("blocked");
  });

  test("marks only complete, fresh green checks as ready", () => {
    expect(
      deriveReadiness(
        { severity: "green", oneCStatus: "clear", oneCCheckedAt: "2026-07-13T09:00:00.000Z" },
        now,
      ),
    ).toBe("ready");
  });
});
