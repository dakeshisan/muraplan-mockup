import { useMemo } from "react";
import { MapPin, X, ChevronRight } from "lucide-react";
import { useRouterState, Link } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/workspace";
import { findNavItem } from "./nav";

/**
 * Единая «Ось объекта» для ATLAS-модулей: показывает текущий скоуп,
 * даёт сбросить на «Все объекты». Виден только на реестровых/дашбордных
 * модулях ATLAS. Крошки в TopBar сокращены до 3 уровней, поэтому этот
 * баннер — основной сигнал, что фильтр по объекту применён.
 */
const SCOPED_ROUTES = new Set([
  "/gpr",
  "/supply",
  "/finance",
  "/pto",
  "/rp",
  "/object",
  "/portfolio",
  "/command",
  "/league",
]);

export function ScopeBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { selectedObject, setObjectId, space } = useWorkspace();
  const item = useMemo(() => findNavItem(pathname), [pathname]);
  if (space !== "atlas") return null;
  if (!SCOPED_ROUTES.has(pathname)) return null;

  const isAll = selectedObject.id === "all";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-1.5 text-[11px] ${
        isAll
          ? "border-border/60 bg-muted/40 text-muted-foreground"
          : "border-accent/30 bg-accent/10 text-accent-foreground"
      }`}
    >
      <span className="flex items-center gap-1.5 font-semibold">
        <MapPin className="h-3.5 w-3.5" />
        Скоуп
      </span>
      <span className="flex items-center gap-1 truncate">
        <Link to="/" className="font-semibold hover:underline">ATLAS</Link>
        <ChevronRight className="h-3 w-3 opacity-50" />
        <span className={isAll ? "font-semibold text-foreground" : "font-bold"}>
          {selectedObject.name}
        </span>
        {item && (
          <>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="font-semibold text-foreground">{item.title}</span>
          </>
        )}
      </span>
      <span className="ml-auto flex items-center gap-2">
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.1em] opacity-70">
          {isAll ? "показаны все объекты" : "реестры фильтруются по объекту"}
        </span>
        {!isAll && (
          <button
            type="button"
            onClick={() => setObjectId("all")}
            className="inline-flex items-center gap-1 rounded-full border border-current/40 bg-background/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-background"
          >
            <X className="h-3 w-3" />
            Все объекты
          </button>
        )}
      </span>
    </div>
  );
}
