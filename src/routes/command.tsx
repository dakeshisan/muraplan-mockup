import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  Timer,
  Wallet,
  Flame,
  Target,
  Building2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Users,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/command")({
  head: () => ({
    meta: [
      { title: "Командный центр — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Пульс компании: цели квартала, портфель ЖК, риски и KPI одним экраном.",
      },
      { property: "og:title", content: "Командный центр — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Пульс компании: цели квартала, портфель ЖК, риски и KPI одним экраном.",
      },
    ],
  }),
  component: CommandCenter,
});

type Health = "green" | "yellow" | "red";

interface Goal {
  label: string;
  fact: string;
  plan: string;
  pct: number; // 0..120
  hint: string;
  icon: LucideIcon;
}

const goals: Goal[] = [
  {
    label: "Продажи, Q4",
    fact: "38,4 млрд ₸",
    plan: "48,0 млрд ₸",
    pct: 80,
    hint: "Темп выше прошлого квартала на 6%",
    icon: TrendingUp,
  },
  {
    label: "Ввод в эксплуатацию",
    fact: "2 из 3 ЖК",
    plan: "3 ЖК до 31.12",
    pct: 67,
    hint: "ЖК Аура — риск сдвига на 3 недели",
    icon: Building2,
  },
  {
    label: "Валовая прибыль",
    fact: "9,1 млрд ₸",
    plan: "10,5 млрд ₸",
    pct: 87,
    hint: "Маржа 23,7% · план 24,0%",
    icon: Target,
  },
];

interface Fire {
  title: string;
  where: string;
  detail: string;
  action: string;
  href: string;
  tone: "danger" | "warning";
  icon: LucideIcon;
}

const fires: Fire[] = [
  {
    title: "Отставание стройки",
    where: "ЖК Аура · Блок 3",
    detail: "−12 дней к графику · монолит 7 этажа",
    action: "Разобрать объект",
    href: "/object",
    tone: "danger",
    icon: AlertTriangle,
  },
  {
    title: "Продажи ниже плана",
    where: "ЖК Көктем",
    detail: "62% темпа · −180 млн ₸ к неделе",
    action: "Портфель",
    href: "/portfolio",
    tone: "warning",
    icon: TrendingUp,
  },
  {
    title: "Кассовый риск",
    where: "218 млн ₸ к оплате за 5 дней",
    detail: "Разрыв в понедельник · 46 млн ₸",
    action: "Финансы",
    href: "/finance",
    tone: "danger",
    icon: Wallet,
  },
];

interface Kpi {
  label: string;
  value: string;
  sub: string;
  delta: number; // %
  icon: LucideIcon;
}

const kpis: Kpi[] = [
  { label: "Продажи, месяц", value: "1,84 млрд ₸", sub: "112% плана", delta: 12, icon: TrendingUp },
  { label: "Стройка в срок", value: "78%", sub: "цель 85%", delta: -4, icon: Timer },
  { label: "Приход, месяц", value: "2,10 млрд ₸", sub: "1 320 платежей", delta: 8, icon: ArrowUpRight },
  { label: "Расход, месяц", value: "1,62 млрд ₸", sub: "к оплате 218 млн", delta: 3, icon: ArrowDownRight },
  { label: "Темп продаж", value: "6,4 кв/день", sub: "неделя ⌀", delta: 5, icon: Zap },
  { label: "Лиды, месяц", value: "1 284", sub: "конверсия 6,1%", delta: 9, icon: Users },
];

interface Complex {
  code: string;
  name: string;
  city: string;
  build: number; // %
  sold: number; // %
  deadline: string;
  deadlineDelta: number; // days, - late
  money: string;
  moneySub: string;
  health: Health;
  note: string;
}

const portfolio: Complex[] = [
  {
    code: "AUR",
    name: "ЖК Аура",
    city: "Алматы",
    build: 72,
    sold: 64,
    deadline: "Q1'27",
    deadlineDelta: -12,
    money: "58,4 млрд ₸",
    moneySub: "маржа 24%",
    health: "red",
    note: "Монолит Блока 3 отстаёт",
  },
  {
    code: "KKT",
    name: "ЖК Көктем",
    city: "Астана",
    build: 88,
    sold: 51,
    deadline: "Q4'26",
    deadlineDelta: 0,
    money: "42,1 млрд ₸",
    moneySub: "маржа 22%",
    health: "yellow",
    note: "Темп продаж −38%",
  },
  {
    code: "NRS",
    name: "ЖК Нұрсая",
    city: "Шымкент",
    build: 95,
    sold: 92,
    deadline: "Q4'26",
    deadlineDelta: 3,
    money: "31,6 млрд ₸",
    moneySub: "маржа 26%",
    health: "green",
    note: "Готов к сдаче",
  },
  {
    code: "ARM",
    name: "ЖК Арман",
    city: "Алматы",
    build: 44,
    sold: 38,
    deadline: "Q3'27",
    deadlineDelta: 5,
    money: "36,8 млрд ₸",
    moneySub: "маржа 25%",
    health: "green",
    note: "Идёт по графику",
  },
  {
    code: "ZHL",
    name: "ЖК Жұлдыз",
    city: "Астана",
    build: 61,
    sold: 72,
    deadline: "Q2'27",
    deadlineDelta: 2,
    money: "44,2 млрд ₸",
    moneySub: "маржа 27%",
    health: "green",
    note: "Продажи опережают",
  },
  {
    code: "SLM",
    name: "ЖК Салтанат",
    city: "Караганда",
    build: 28,
    sold: 22,
    deadline: "Q4'27",
    deadlineDelta: -6,
    money: "24,9 млрд ₸",
    moneySub: "маржа 21%",
    health: "yellow",
    note: "Задержка ТУ по сетям",
  },
  {
    code: "BYT",
    name: "ЖК Байтерек",
    city: "Астана",
    build: 100,
    sold: 98,
    deadline: "Сдан",
    deadlineDelta: 0,
    money: "18,4 млрд ₸",
    moneySub: "маржа 28%",
    health: "green",
    note: "Гарантийный период",
  },
  {
    code: "ALA",
    name: "ЖК Алатау",
    city: "Алматы",
    build: 15,
    sold: 8,
    deadline: "Q1'28",
    deadlineDelta: 0,
    money: "27,1 млрд ₸",
    moneySub: "план маржа 24%",
    health: "green",
    note: "Котлован · старт продаж",
  },
  {
    code: "TMR",
    name: "ЖК Тумар",
    city: "Актобе",
    build: 54,
    sold: 41,
    deadline: "Q3'27",
    deadlineDelta: -4,
    money: "28,5 млрд ₸",
    moneySub: "маржа 23%",
    health: "yellow",
    note: "Простой бригад · 4 дня",
  },
];

const healthMeta: Record<Health, { chip: string; dot: string; label: string; icon: LucideIcon }> = {
  green: {
    chip: "bg-success/10 text-success ring-1 ring-success/20",
    dot: "bg-success",
    label: "В норме",
    icon: CheckCircle2,
  },
  yellow: {
    chip: "bg-warning/15 text-accent-foreground ring-1 ring-warning/30",
    dot: "bg-warning",
    label: "Внимание",
    icon: AlertTriangle,
  },
  red: {
    chip: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
    dot: "bg-destructive",
    label: "Риск",
    icon: Flame,
  },
};

function ProgressBar({ pct, tone = "primary" }: { pct: number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const toneClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-destructive"
          : "bg-linear-to-r from-primary to-accent";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${toneClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function DeltaChip({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span
      className={`tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {v}%
    </span>
  );
}

function CommandCenter() {
  const greenCount = portfolio.filter((p) => p.health === "green").length;
  const yellowCount = portfolio.filter((p) => p.health === "yellow").length;
  const redCount = portfolio.filter((p) => p.health === "red").length;

  const totalMoney = "312 млрд ₸";
  const totalSold = Math.round(portfolio.reduce((s, p) => s + p.sold, 0) / portfolio.length);
  const totalBuild = Math.round(portfolio.reduce((s, p) => s + p.build, 0) / portfolio.length);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-foreground/70">Пульс компании · сегодня</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Командный центр</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Один экран для первого лица: цели квартала, риски дня и здоровье 9 ЖК.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success ring-1 ring-success/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            {greenCount} из 9 зелёных
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-warning/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            {yellowCount} внимания
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive ring-1 ring-destructive/20">
            <Flame className="h-3.5 w-3.5" />
            {redCount} риск
          </span>
        </div>
      </div>

      {/* Cockpit — quarter goals */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Цели квартала
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">осталось 47 дней</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {goals.map((g) => {
            const tone: "success" | "warning" | "danger" | "primary" =
              g.pct >= 90 ? "success" : g.pct >= 70 ? "primary" : g.pct >= 50 ? "warning" : "danger";
            return (
              <div key={g.label} className="card-soft group p-5 transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {g.label}
                    </div>
                    <div className="tnum mt-1 text-2xl font-extrabold tracking-tight">{g.fact}</div>
                    <div className="tnum text-[11px] text-muted-foreground">из {g.plan}</div>
                  </div>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft transition-colors group-hover:bg-accent/60">
                    <g.icon className="h-5 w-5 text-accent-foreground/80" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="tnum mb-1.5 flex items-center justify-between text-[11px] font-bold">
                    <span className={tone === "danger" ? "text-destructive" : "text-foreground"}>{g.pct}%</span>
                    <span className="text-muted-foreground">цель 100%</span>
                  </div>
                  <ProgressBar pct={g.pct} tone={tone} />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">{g.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Где горит */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Где горит сегодня
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">3 приоритета</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {fires.map((f) => {
            const isDanger = f.tone === "danger";
            return (
              <Link
                key={f.title}
                to={f.href}
                className={`card-soft group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  isDanger ? "ring-1 ring-destructive/20" : "ring-1 ring-warning/25"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${isDanger ? "bg-destructive" : "bg-warning"}`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      isDanger ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-accent-foreground"
                    }`}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isDanger ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-accent-foreground"
                    }`}
                  >
                    {isDanger ? "Риск" : "Внимание"}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {f.title}
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold leading-tight">{f.where}</div>
                  <p className="tnum mt-1 text-xs text-muted-foreground">{f.detail}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-foreground">
                  {f.action}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPI row */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            KPI · месяц
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">обновлено 5 мин назад</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.label} className="card-soft p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {k.label}
                </span>
                <k.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
              <div className="tnum mt-2 text-xl font-extrabold tracking-tight">{k.value}</div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="tnum truncate text-[11px] text-muted-foreground">{k.sub}</span>
                <DeltaChip v={k.delta} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio 9 */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Портфель · 9 ЖК
          </h2>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-foreground hover:underline"
          >
            Открыть портфель <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {portfolio.map((p) => {
            const h = healthMeta[p.health];
            const HIcon = h.icon;
            const late = p.deadlineDelta < 0;
            return (
              <Link
                key={p.code}
                to="/object"
                className="card-soft group relative flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className={`absolute left-0 top-5 h-8 w-1 rounded-r-full ${h.dot}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-[11px] font-extrabold text-accent-foreground">
                      {p.code}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-extrabold leading-tight">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.city}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${h.chip}`}>
                    <HIcon className="h-3 w-3" />
                    {h.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="tnum flex items-baseline justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wide text-muted-foreground">Стройка</span>
                      <span className="font-extrabold">{p.build}%</span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar pct={p.build} tone={p.health === "red" ? "danger" : p.health === "yellow" ? "warning" : "primary"} />
                    </div>
                  </div>
                  <div>
                    <div className="tnum flex items-baseline justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-wide text-muted-foreground">Продано</span>
                      <span className="font-extrabold">{p.sold}%</span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar pct={p.sold} tone="success" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[11px]">
                  <div>
                    <div className="font-bold uppercase tracking-wide text-muted-foreground">Срок</div>
                    <div className="tnum mt-0.5 flex items-center gap-1 font-extrabold">
                      {p.deadline}
                      {p.deadlineDelta !== 0 && (
                        <span
                          className={`tnum rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            late
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {late ? "" : "+"}
                          {p.deadlineDelta}д
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold uppercase tracking-wide text-muted-foreground">Деньги</div>
                    <div className="tnum mt-0.5 font-extrabold">{p.money}</div>
                    <div className="tnum text-[10px] text-muted-foreground">{p.moneySub}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span className="truncate">{p.note}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Company summary */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Свод по компании
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">9 ЖК · 4 города</span>
        </div>
        <div className="card-soft grid gap-6 p-6 md:grid-cols-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Стоимость портфеля
            </div>
            <div className="tnum mt-1 text-2xl font-extrabold">{totalMoney}</div>
            <div className="tnum mt-1 text-[11px] text-muted-foreground">маржа ⌀ 24,3%</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Средняя готовность
            </div>
            <div className="tnum mt-1 text-2xl font-extrabold">{totalBuild}%</div>
            <div className="mt-2"><ProgressBar pct={totalBuild} /></div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Средняя распроданность
            </div>
            <div className="tnum mt-1 text-2xl font-extrabold">{totalSold}%</div>
            <div className="mt-2"><ProgressBar pct={totalSold} tone="success" /></div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Здоровье портфеля
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm font-extrabold">
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="tnum">{greenCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-extrabold">
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="tnum">{yellowCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-extrabold">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="tnum">{redCount}</span>
              </div>
            </div>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full">
              <div className="bg-success" style={{ width: `${(greenCount / 9) * 100}%` }} />
              <div className="bg-warning" style={{ width: `${(yellowCount / 9) * 100}%` }} />
              <div className="bg-destructive" style={{ width: `${(redCount / 9) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Motivation strip */}
      <section className="card-soft flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft">
            <Gauge className="h-5 w-5 text-accent-foreground/80" />
          </div>
          <div>
            <div className="text-sm font-extrabold">Команда идёт к цели квартала</div>
            <p className="text-[11px] text-muted-foreground">
              Общий прогресс по трём целям — 78%. Достаточно закрыть ЖК Аура в срок и подтянуть Көктем.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Портфель <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/gpr"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-ring"
          >
            Полный ГПР
          </Link>
        </div>
      </section>
    </div>
  );
}
