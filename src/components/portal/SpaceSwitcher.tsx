import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, Newspaper, Sun } from "lucide-react";
import { useRole } from "@/lib/role";

/**
 * Сегментированный переключатель пространств «Сегодня · Компания · ATLAS».
 * «Сегодня» — личный дом (/), «Компания» — портал сотрудника (/portal),
 * «ATLAS» — стройка. Пункт ATLAS скрыт, если у роли нет доступа ни к одному модулю.
 */
export function SpaceSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { allowed } = useRole();
  const hasAtlas = allowed.some((p) => p !== "/" && !p.startsWith("/portal"));

  const space: "today" | "company" | "atlas" =
    pathname === "/"
      ? "today"
      : pathname.startsWith("/portal")
        ? "company"
        : "atlas";

  const base =
    "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const active = "bg-primary text-primary-foreground shadow-sm";
  const inactive =
    "text-muted-foreground hover:bg-background hover:text-foreground";

  return (
    <div
      role="tablist"
      aria-label="Пространство"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/60 p-0.5"
    >
      <Link
        to="/"
        role="tab"
        aria-selected={space === "today"}
        className={`${base} ${space === "today" ? active : inactive}`}
      >
        <Sun className="h-3.5 w-3.5" />
        Сегодня
      </Link>
      <Link
        to="/portal"
        role="tab"
        aria-selected={space === "company"}
        className={`${base} ${space === "company" ? active : inactive}`}
      >
        <Newspaper className="h-3.5 w-3.5" />
        Компания
      </Link>
      {hasAtlas && (
        <Link
          to="/command"
          role="tab"
          aria-selected={space === "atlas"}
          className={`${base} ${space === "atlas" ? active : inactive}`}
        >
          <Building2 className="h-3.5 w-3.5" />
          ATLAS
        </Link>
      )}
    </div>
  );
}
