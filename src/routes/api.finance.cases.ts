import { createFileRoute } from "@tanstack/react-router";
import { getPilotIdentity } from "@/server/pilot-auth.server";
import { hasDatabaseConfig } from "@/server/pilot-config.server";
import { listAuraFinanceCases } from "@/server/pilot-db.server";

export const Route = createFileRoute("/api/finance/cases")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!getPilotIdentity(request)) {
          const authenticated = request.headers.get("x-atlas-authenticated") === "true";
          return new Response(authenticated ? "Forbidden" : "Unauthorized", {
            status: authenticated ? 403 : 401,
          });
        }
        const headers = { "Cache-Control": "private, no-store" };
        if (!hasDatabaseConfig()) {
          return Response.json({ cases: [], sourceStatus: "not_configured" }, { headers });
        }

        try {
          return Response.json(
            { cases: await listAuraFinanceCases(), sourceStatus: "ready" },
            { headers },
          );
        } catch {
          return new Response("Source unavailable", { status: 503 });
        }
      },
    },
  },
});
