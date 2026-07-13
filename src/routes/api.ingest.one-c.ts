import { createFileRoute } from "@tanstack/react-router";
import { verifyIngestSignature } from "@/server/pilot-config.server";
import { ingestOneCImport } from "@/server/pilot-db.server";
import { oneCImportSchema } from "@/server/pilot-domain";

export const Route = createFileRoute("/api/ingest/one-c")({
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
        const parsed = oneCImportSchema.safeParse(body);
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });

        const result = await ingestOneCImport(parsed.data);
        return Response.json(result, { status: result.duplicate ? 200 : 202 });
      },
    },
  },
});
