import { Link } from "@tanstack/react-router";
import { Lock, ArrowLeft, UserCog, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role";
import { findNavItem } from "./nav";

// Владелец модуля — куда писать за расширение доступа.
const MODULE_OWNER: Record<string, { name: string; role: string; email: string }> = {
  "/command": { name: "Алдияр Ж.", role: "Дир. по строительству", email: "aldiyar@atamura.kz" },
  "/portfolio": { name: "Даурен С.", role: "Собственник · офис", email: "office@atamura.kz" },
  "/rp": { name: "Ержан Касымов", role: "Руководитель проекта", email: "yerzhan@atamura.kz" },
  "/gpr": { name: "Ержан Касымов", role: "Руководитель проекта", email: "yerzhan@atamura.kz" },
  "/league": { name: "Ержан Касымов", role: "Руководитель проекта", email: "yerzhan@atamura.kz" },
  "/object": { name: "Ержан Касымов", role: "Руководитель проекта", email: "yerzhan@atamura.kz" },
  "/foreman": { name: "Тимур А.", role: "Прораб · Аура", email: "timur@atamura.kz" },
  "/supply": { name: "Динара М.", role: "Руководитель снабжения", email: "dinara@atamura.kz" },
  "/pto": { name: "Айгуль Т.", role: "Начальник ПТО", email: "ptо@atamura.kz" },
  "/finance": { name: "Мадина Ж.", role: "Финансовый директор", email: "madina@atamura.kz" },
};

export function NoAccess({ pathname }: { pathname: string }) {
  const { persona } = useRole();
  const item = findNavItem(pathname);
  const owner = MODULE_OWNER[pathname];

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-accent-foreground shadow-sm">
        <Lock className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
        У этой роли нет модуля
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        «<span className="font-semibold text-foreground">{item?.title ?? pathname}</span>»
        не входит в контур роли{" "}
        <span className="font-semibold text-foreground">{persona.position}</span>.
      </p>
      {owner && (
        <div className="mt-5 w-full rounded-lg border border-border bg-muted/40 px-4 py-3 text-left text-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Кому написать за доступ
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-extrabold text-foreground">{owner.name}</div>
              <div className="truncate text-[12px] text-muted-foreground">{owner.role}</div>
            </div>
            <a
              href={`mailto:${owner.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-bold text-foreground shadow-sm hover:border-primary"
            >
              <Mail className="h-3.5 w-3.5" />
              {owner.email}
            </a>
          </div>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link to="/" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            К «Сегодня»
          </Link>
        </Button>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
          <UserCog className="h-3.5 w-3.5" />
          Смена роли — в топбаре справа
        </div>
      </div>
    </div>
  );
}
