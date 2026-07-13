import { createFileRoute } from "@tanstack/react-router";
import { verifyIngestSignature } from "@/server/pilot-config.server";
import { ingestSherlockSnapshot } from "@/server/pilot-db.server";
import { sherlockSnapshotSchema } from "@/server/pilot-domain";

export const Route = createFileRoute("/api/ingest/sherlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        if (rawBody.length > 100_000 || !verifyIngestSignature(request, rawBody)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: unknown;
        try {
          body = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }
        const parsed = sherlockSnapshotSchema.safeParse(body);
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });

        const result = await ingestSherlockSnapshot(parsed.data);
        return Response.json(result, { status: result.duplicate ? 200 : 202 });
      },
    },
  },
});
