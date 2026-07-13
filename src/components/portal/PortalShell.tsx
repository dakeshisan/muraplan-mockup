import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "./AppSidebar";
import { TopBar, DemoBanner } from "./TopBar";
import { RoleProvider, useRole } from "@/lib/role";
import { ThemeProvider } from "@/lib/theme";
import { NoAccess } from "./NoAccess";
import { allNavItems } from "./nav";
import { CommandPaletteProvider } from "./CommandPalette";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace";
import { PortalSpaceSidebar } from "./PortalSpaceSidebar";
import { OpenedFromPortalBanner } from "./TopBar";
import { PersonaPickerProvider } from "./PersonaPicker";
import { ScopeBanner } from "./ScopeBanner";

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Пилотный финансовый экран не монтирует демо-провайдеры, локальные роли
  // или выбор персоны. Его доступ контролируется сервером до SSR.
  if (pathname === "/finance" || pathname === "/login") return <>{children}</>;

  return (
    <ThemeProvider>
      <RoleProvider>
        <WorkspaceProvider>
          <CommandPaletteProvider>
            <PersonaPickerProvider>
              <PortalShellInner>{children}</PortalShellInner>
              <Toaster position="top-right" richColors closeButton />
            </PersonaPickerProvider>
          </CommandPaletteProvider>
        </WorkspaceProvider>
      </RoleProvider>
    </ThemeProvider>
  );
}

function PortalShellInner({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { canAccess } = useRole();
  const { space } = useWorkspace();
  // Мобайл прораба — самостоятельный продукт: без сайдбара, топбара,
  // ⌘K-подсказки в UI. Провайдеры остаются (роль/тема/воркспейс).
  if (pathname === "/foreman/mobile") {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }
  const isKnownAtlasRoute = allNavItems.some((i) => i.url === pathname);
  const denied = space === "atlas" && isKnownAtlasRoute && !canAccess(pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
        >
          Перейти к содержимому
        </a>
        {space === "atlas" ? <AppSidebar /> : <PortalSpaceSidebar />}
        <div className="flex min-w-0 flex-1 flex-col">
          <DemoBanner />
          <TopBar />
          {space === "atlas" && <OpenedFromPortalBanner />}
          {space === "atlas" && <ScopeBanner />}
          <main
            id="content"
            tabIndex={-1}
            aria-label={denied ? "Нет доступа" : "Основной контент"}
            key={pathname}
            className={`animate-page-in flex-1 focus:outline-none ${
              space === "company" ? "px-4 py-8 sm:px-8 sm:py-10" : "px-3 py-5 sm:px-6 sm:py-6"
            }`}
          >
            {denied ? <NoAccess pathname={pathname} /> : children}
          </main>
          <footer className="px-6 pb-5 pt-2 text-center text-[11px] text-muted-foreground/70">
            Данные условные, имена вымышленные, суммы демонстрационные.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
