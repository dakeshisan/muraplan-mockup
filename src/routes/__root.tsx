import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PortalShell } from "../components/portal/PortalShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card-soft mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-accent-foreground">
          <span className="tnum text-2xl font-black">404</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Страница не найдена</h1>
        <p className="text-sm text-muted-foreground">
          Такого маршрута в портале ATLAS нет — возможно, он переименован или доступен другой роли.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Вернуться на Хаб
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card-soft mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <span className="text-2xl font-black">!</span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">Страница не загрузилась</h1>
        <p className="text-sm text-muted-foreground">
          Что-то пошло не так. Попробуйте перезагрузить экран или вернуться на Хаб.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Повторить
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-ring"
          >
            На Хаб
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ATLAS — портал ATAMURA" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      {
        name: "description",
        content:
          "Единый корпоративный портал строительной компании ATAMURA: дирекция, стройка, снабжение, ПТО и финансы.",
      },
      { name: "author", content: "ATAMURA" },
      { property: "og:title", content: "ATLAS — портал ATAMURA" },
      {
        property: "og:description",
        content: "Единый корпоративный портал строительной компании ATAMURA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <PortalShell>
        <Outlet />
      </PortalShell>
    </QueryClientProvider>
  );
}
