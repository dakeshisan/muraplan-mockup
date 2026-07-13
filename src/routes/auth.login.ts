import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  server: {
    handlers: {
      GET: async () => {
        const loginUrl = process.env.ATLAS_SSO_LOGIN_URL;
        if (!loginUrl) return new Response("Corporate SSO is not configured", { status: 503 });
        return Response.redirect(loginUrl, 302);
      },
    },
  },
});
