import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileSignature,
  GraduationCap,
  ListChecks,
  Newspaper,
  Receipt,
  Users,
} from "lucide-react";
import { useRole } from "@/lib/role";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Сегодня — Портал ATAMURA" },
      {
        name: "description",
        content:
          "Персональный inbox сотрудника ATAMURA: задачи Портала и работа в ATLAS в одном списке.",
      },
    ],
  }),
  component: PortalToday,
});

interface TodoItem {
  id: string;
  kind: "hr" | "atlas" | "learn";
  title: string;
  desc: string;
  meta: string;
  action: string;
  to?: string;
  search?: Record<string, string>;
  tone: "portal" | "atlas" | "gold";
}

const todos: TodoItem[] = [
  {
    id: "hr-vacation",
    kind: "hr",
    title: "Согласовать заявление на отпуск",
    desc: "Дана Оспанова · Отдел маркетинга · 14–28 июля",
    meta: "HR · ожидает 2 дня",
    action: "Открыть",
    tone: "portal",
  },
  {
    id: "atlas-avr-015",
    kind: "atlas",
    title: "Акт АВР-015 на вашей визе",
    desc: "АлюмФасад · ЖК Аура · 12,8 млн ₸ · вердикт СБ: зелёный",
    meta: "ATLAS · Финансы и акты",
    action: "Открыть в ATLAS",
    to: "/finance",
    search: { from: "portal", act: "АВР-015", object: "aura" },
    tone: "atlas",
  },
  {
    id: "atlas-ks2-047",
    kind: "atlas",
    title: "КС-2 №047 · Монолит-KZ",
    desc: "ЖК Атмосфера · Блок 2 · возврат на доработку от ПТО",
    meta: "ATLAS · Финансы и акты",
    action: "Открыть в ATLAS",
    to: "/finance",
    search: { from: "portal", act: "КС-2-047", object: "atmosfera" },
    tone: "atlas",
  },
  {
    id: "atlas-ks3-012",
    kind: "atlas",
    title: "КС-3 №012 · ЭлектроСтрой",
    desc: "ЖК Керуен · оплата к пятнице · чек-лист аудита завершён",
    meta: "ATLAS · Финансы и акты",
    action: "Открыть в ATLAS",
    to: "/finance",
    search: { from: "portal", act: "КС-3-012", object: "keruen" },
    tone: "atlas",
  },
  {
    id: "hr-appraisal",
    kind: "hr",
    title: "Оценка полугодия · подчинённые",
    desc: "5 сотрудников — оценить до 20 июля",
    meta: "HR · через 4 дня",
    action: "Открыть",
    tone: "portal",
  },
  {
    id: "learn-course",
    kind: "learn",
    title: "Курс «Безопасность на стройке»",
    desc: "Осталось 2 модуля · дедлайн 25 июля",
    meta: "Академия · 18 мин",
    action: "Продолжить",
    tone: "gold",
  },
];

const toneClasses = {
  portal: {
    ring: "border-accent/30 bg-accent/5",
    chip: "bg-accent text-accent-foreground",
    btn: "bg-accent text-accent-foreground hover:bg-accent/90",
    iconWrap: "bg-accent/20 text-accent-foreground",
  },
  atlas: {
    ring: "border-primary/30 bg-primary/5",
    chip: "bg-primary text-primary-foreground",
    btn: "bg-primary text-primary-foreground hover:bg-primary/90",
    iconWrap: "bg-primary/15 text-primary",
  },
  gold: {
    ring: "border-warning/30 bg-warning/5",
    chip: "bg-warning/90 text-warning-foreground",
    btn: "bg-warning text-warning-foreground hover:bg-warning/90",
    iconWrap: "bg-warning/15 text-warning",
  },
} as const;

const kindIcon = { hr: Users, atlas: FileSignature, learn: GraduationCap } as const;

function PortalToday() {
  const [greeting, setGreeting] = useState("Добрый день");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер",
    );
  }, []);
  const { persona } = useRole();

  const atlasCount = todos.filter((t) => t.kind === "atlas").length;
  const portalCount = todos.filter((t) => t.kind === "hr").length;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <p className="text-sm font-semibold text-accent-foreground/70">
          Портал ATAMURA · Сегодня
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {greeting}, {persona.greetingName}!
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Персональный inbox — что от вас ждут сегодня. Задачи Портала и работа в ATLAS
          в одном списке.
        </p>
      </header>

      {/* Сводка из обоих пространств */}
      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          icon={Briefcase}
          label="Работа в ATLAS"
          value={atlasCount}
          hint="акты и решения"
          tone="atlas"
          to="/finance"
        />
        <SummaryTile
          icon={ListChecks}
          label="Задачи Портала"
          value={portalCount}
          hint="HR · согласования"
          tone="portal"
        />
        <SummaryTile
          icon={Calendar}
          label="Событий сегодня"
          value={1}
          hint="общее собрание 15:00"
          tone="gold"
        />
      </section>

      {/* Inbox дел */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
            Дела на сегодня
          </h2>
          <span className="tnum text-[11px] font-semibold text-muted-foreground">
            {todos.length} карточек
          </span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {todos.map((t) => {
            const tone = toneClasses[t.tone];
            const Icon = kindIcon[t.kind];
            return (
              <li
                key={t.id}
                className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${tone.ring}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone.iconWrap}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${tone.chip}`}
                      >
                        {t.meta}
                      </span>
                    </div>
                    <div className="mt-1.5 font-extrabold leading-snug tracking-tight">
                      {t.title}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                {t.to ? (
                  <Link
                    to={t.to}
                    search={t.search}
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${tone.btn}`}
                  >
                    {t.action}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${tone.btn}`}
                  >
                    {t.action}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Быстрый вход в разделы Портала */}
      <section>
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
          Пространство Портала
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink
            to="/portal/news"
            icon={Newspaper}
            title="Новости"
            desc="Внутренний журнал ATAMURA"
          />
          <QuickLink
            to="/portal/people"
            icon={Users}
            title="Люди"
            desc="Коллеги · подразделения"
          />
          <QuickLink
            to="/portal/payments"
            icon={Receipt}
            title="Оплаты"
            desc="Реестр заявок сотрудника"
          />
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <span>
          Работа в ATLAS открывается в том же топбаре. В карточке акта увидите плашку
          «Открыто из Портала · Вернуться».
        </span>
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  to,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number;
  hint: string;
  tone: "portal" | "atlas" | "gold";
  to?: string;
}) {
  const tw = toneClasses[tone];
  const inner = (
    <div className={`card-soft flex items-center gap-4 p-5 ${tw.ring}`}>
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tw.iconWrap}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="tnum text-2xl font-extrabold">{value}</div>
        <div className="truncate text-[11px] text-muted-foreground">{hint}</div>
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block transition-transform hover:-translate-y-0.5">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function QuickLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="card-soft group flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-accent-foreground transition-colors group-hover:bg-accent/60">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-extrabold tracking-tight">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
