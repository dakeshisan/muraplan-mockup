import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } }),
    },
  },
});
