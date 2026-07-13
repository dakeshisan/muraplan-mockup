import { createFileRoute } from "@tanstack/react-router";
import { hasDatabaseConfig } from "@/server/pilot-config.server";

export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { status: hasDatabaseConfig() ? "ready" : "not_ready" },
          { status: hasDatabaseConfig() ? 200 : 503, headers: { "Cache-Control": "no-store" } },
        ),
    },
  },
});
