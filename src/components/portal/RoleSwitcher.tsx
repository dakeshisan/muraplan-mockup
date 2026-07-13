import { Check, ChevronDown, UserCog, RefreshCcw } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canAccess, useRole, type Role } from "@/lib/role";
import { usePersonaPicker } from "./PersonaPicker";

export function RoleSwitcher() {
  const { role, persona, setRole, personas } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { openPicker } = usePersonaPicker();

  const handleSelect = (r: Role) => {
    if (r === role) return;
    const target = personas.find((p) => p.id === r);
    setRole(r);
    if (target) {
      toast.success(`Вошли как ${target.name}`, {
        description: target.position,
        duration: 1800,
      });
    }
    if (!canAccess(r, pathname)) {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground 2xl:inline"
        title="Роль меняет доступные модули"
      >
        Роль меняет модули
      </span>
      <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Переключить роль · роль меняет доступные модули"
        title="Роль меняет доступные модули"
        className="group flex items-center gap-2 rounded-full border-2 border-accent/60 bg-background px-2 py-1 text-left shadow-sm ring-1 ring-accent/20 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
        >
          {persona.initials}
        </div>
        <div className="hidden min-w-0 leading-tight xl:block">
          <div className="truncate text-[12px] font-bold text-foreground">{persona.name}</div>
          <div className="truncate text-[10px] font-medium text-muted-foreground">
            {persona.position}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <UserCog className="h-3.5 w-3.5" />
          Войти как…
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personas.map((p) => {
          const active = p.id === role;
          return (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => handleSelect(p.id)}
              className="flex items-start gap-3 py-2"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-accent-foreground">
                {p.initials}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-bold text-foreground">{p.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">{p.position}</div>
              </div>
              {active && <Check className="mt-1 h-4 w-4 text-success" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => openPicker()}
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
          Сменить персону…
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground">
          Демо-RBAC: сайдбар и Хаб покажут только доступные модули выбранной роли.
        </div>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
