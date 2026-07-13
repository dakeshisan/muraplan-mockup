import { useRouterState, Link } from "@tanstack/react-router";
import { Bell, Search, ChevronRight, Sparkles, ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { findNavItem } from "./nav";
import { findPortalItem } from "./portal-space-nav";
import { RoleSwitcher } from "./RoleSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useCommandPalette } from "./CommandPalette";
import { SpaceSwitcher } from "./SpaceSwitcher";
import { ObjectSelector } from "./ObjectSelector";
import { useWorkspace } from "@/lib/workspace";
import { toast } from "sonner";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-1.5 bg-accent px-4 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-foreground">
      <Sparkles className="h-3 w-3" />
      Демо-режим · данные условные
    </div>
  );
}

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { space, selectedObject } = useWorkspace();
  const atlasItem = findNavItem(pathname);
  const portalItem = findPortalItem(pathname);
  const { setOpen } = useCommandPalette();
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5">
        {/* Слева: триггер сайдбара + переключатель пространств */}
        <SidebarTrigger className="shrink-0 text-muted-foreground" />
        <div className="shrink-0">
          <SpaceSwitcher />
        </div>

        {/* Крошки — сжимаются, могут скрываться до последнего уровня */}
        <nav
          aria-label="Хлебные крошки"
          className="hidden min-w-0 flex-1 items-center gap-1 text-sm xl:flex"
        >
            {space === "company" ? (
              <>
                <Link
                  to="/portal"
                  className="hidden shrink-0 font-semibold text-muted-foreground transition-colors hover:text-foreground lg:inline"
                >
                  Компания
                </Link>
                {portalItem && portalItem.url !== "/portal" && (
                  <>
                    <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/50 lg:block" />
                    <span className="truncate font-bold text-foreground">
                      {portalItem.title}
                    </span>
                  </>
                )}
              </>
            ) : space === "today" ? (
              <Link
                to="/"
                className="hidden shrink-0 font-semibold text-foreground lg:inline"
              >
                Сегодня
              </Link>
            ) : (
              <>
                <Link
                  to="/"
                  className="hidden shrink-0 font-semibold text-muted-foreground transition-colors hover:text-foreground lg:inline"
                >
                  ATLAS
                </Link>
                {selectedObject.id !== "all" && (
                  <>
                    <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/50 lg:block" />
                    <span className="hidden shrink-0 font-semibold text-accent-foreground lg:inline">
                      {selectedObject.short}
                    </span>
                  </>
                )}
                {atlasItem && atlasItem.url !== "/" && (
                  <>
                    <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/50 lg:block" />
                    <span className="truncate font-bold text-foreground">
                      {atlasItem.title}
                    </span>
                  </>
                )}
              </>
            )}
        </nav>

        {/* Гибкий поиск — сжимается, на узких → иконка */}
        <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Открыть командную палитру"
            aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
            className="ml-auto hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">Поиск по порталу…</span>
            <kbd className="tnum shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
        </button>

        {/* Правая группа — компактная, никогда не сжимается */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:ml-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Открыть командную палитру"
            className="text-muted-foreground lg:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>
          {space === "atlas" && (
            <div className="hidden md:block">
              <ObjectSelector />
            </div>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            aria-label="Сменить язык"
            onClick={() => toast("Двуязычный режим появится в следующем обновлении", { duration: 1600 })}
            className="hidden px-2 text-xs font-bold text-muted-foreground xl:inline-flex"
          >
            ҚАЗ
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Уведомления · 3 новых"
            onClick={() =>
              toast("3 новых уведомления", {
                description: "Центр уведомлений — в следующем спринте",
                duration: 1600,
              })
            }
            className="relative text-muted-foreground"
          >
            <Bell className="h-4 w-4" />
            <span aria-hidden className="absolute right-1.5 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground ring-2 ring-card">
              3
            </span>
          </Button>
          <RoleSwitcher />
        </div>
      </div>
      {space === "atlas" && (
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-3 py-1 md:hidden">
          <ObjectSelector />
        </div>
      )}
    </header>
  );
}

/**
 * Плашка «Открыто из Портала · Вернуться». Показывается в ATLAS-роутах,
 * когда пользователь пришёл из карточки Портала (search: from=portal).
 */
export function OpenedFromPortalBanner() {
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, string | undefined>,
  });
  const from = search?.from;
  const act = search?.act;
  if (from !== "portal") return null;
  return (
    <div className="border-b border-accent/30 bg-accent/10 px-4 py-2 text-[12px] font-semibold text-accent-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-accent-foreground">
            Открыто из Портала
          </span>
          {act && (
            <span className="tnum truncate text-accent-foreground/80">
              задача · акт {act}
            </span>
          )}
        </span>
        <Link
          to="/portal"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/40 bg-background px-3 py-1 text-[11px] font-bold text-foreground shadow-sm transition-colors hover:border-accent"
        >
          <ArrowLeft className="h-3 w-3" /> Вернуться в Портал
        </Link>
      </div>
    </div>
  );
}
