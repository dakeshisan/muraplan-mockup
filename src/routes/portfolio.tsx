import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Building2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Percent,
  Coins,
  Flame,
  Snowflake,
  Rocket,
  Crown,
  BadgeDollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Портфель собственника — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Инвестиционный взгляд на 9 ЖК: маржа, ROI, темп продаж, деньги в обороте и рейтинг доходности.",
      },
      { property: "og:title", content: "Портфель собственника — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Инвестиционный взгляд на 9 ЖК: маржа, ROI, темп продаж, деньги в обороте и рейтинг доходности.",
      },
    ],
  }),
  component: PortfolioPage,
});

type Health = "green" | "yellow" | "red";
type Phase = "Котлован" | "Стройка" | "Отделка" | "Сдан";

interface Asset {
  code: string;
  name: string;
  city: string;
  phase: Phase;
  build: number; // %
  sold: number; // % от квартир
  units: number;
  unitsLeft: number;
  invested: number; // млрд ₸
  returned: number; // млрд ₸
  revenue: number; // млрд ₸ (план выручки)
  margin: number; // %
  targetMargin: number; // %
  roi: number; // %
  pace: number; // кв/мес
  paceDelta: number; // %
  health: Health;
  note: string;
}

const assets: Asset[] = [
  {
    code: "AUR",
    name: "ЖК Аура",
    city: "Алматы",
    phase: "Стройка",
    build: 72,
    sold: 64,
    units: 412,
    unitsLeft: 148,
    invested: 44.2,
    returned: 37.4,
    revenue: 58.4,
    margin: 21.8,
    targetMargin: 24,
    roi: 22.5,
    pace: 24,
    paceDelta: -18,
    health: "red",
    note: "Маржа ниже целевой на 2,2 п.п.",
  },
  {
    code: "KKT",
    name: "ЖК Көктем",
    city: "Астана",
    phase: "Отделка",
    build: 88,
    sold: 51,
    units: 356,
    unitsLeft: 174,
    invested: 33.6,
    returned: 21.5,
    revenue: 42.1,
    margin: 22.0,
    targetMargin: 23,
    roi: 25.3,
    pace: 14,
    paceDelta: -38,
    health: "yellow",
    note: "Затоварка · темп ниже плана",
  },
  {
    code: "NRS",
    name: "ЖК Нұрсая",
    city: "Шымкент",
    phase: "Отделка",
    build: 95,
    sold: 92,
    units: 264,
    unitsLeft: 21,
    invested: 24.1,
    returned: 29.1,
    revenue: 31.6,
    margin: 26.4,
    targetMargin: 25,
    roi: 31.1,
    pace: 22,
    paceDelta: 12,
    health: "green",
    note: "Готов к сдаче · остатки распродаются",
  },
  {
    code: "ARM",
    name: "ЖК Арман",
    city: "Алматы",
    phase: "Стройка",
    build: 44,
    sold: 38,
    units: 298,
    unitsLeft: 185,
    invested: 22.6,
    returned: 14.0,
    revenue: 36.8,
    margin: 25.1,
    targetMargin: 24,
    roi: 28.4,
    pace: 19,
    paceDelta: 6,
    health: "green",
    note: "Идёт по плану",
  },
  {
    code: "ZHL",
    name: "ЖК Жұлдыз",
    city: "Астана",
    phase: "Стройка",
    build: 61,
    sold: 72,
    units: 384,
    unitsLeft: 108,
    invested: 28.8,
    returned: 31.8,
    revenue: 44.2,
    margin: 27.3,
    targetMargin: 25,
    roi: 34.2,
    pace: 31,
    paceDelta: 21,
    health: "green",
    note: "Продажи опережают стройку",
  },
  {
    code: "SLM",
    name: "ЖК Салтанат",
    city: "Караганда",
    phase: "Стройка",
    build: 28,
    sold: 22,
    units: 246,
    unitsLeft: 192,
    invested: 12.4,
    returned: 5.5,
    revenue: 24.9,
    margin: 20.6,
    targetMargin: 22,
    roi: 18.2,
    pace: 11,
    paceDelta: -12,
    health: "yellow",
    note: "Задержка ТУ · маржа под давлением",
  },
  {
    code: "BYT",
    name: "ЖК Байтерек",
    city: "Астана",
    phase: "Сдан",
    build: 100,
    sold: 98,
    units: 182,
    unitsLeft: 4,
    invested: 13.2,
    returned: 18.0,
    revenue: 18.4,
    margin: 28.1,
    targetMargin: 26,
    roi: 36.4,
    pace: 8,
    paceDelta: -3,
    health: "green",
    note: "Гарантия · остаток 4 кв.",
  },
  {
    code: "ALA",
    name: "ЖК Алатау",
    city: "Алматы",
    phase: "Котлован",
    build: 15,
    sold: 8,
    units: 214,
    unitsLeft: 197,
    invested: 6.8,
    returned: 2.2,
    revenue: 27.1,
    margin: 24.4,
    targetMargin: 24,
    roi: 29.0,
    pace: 9,
    paceDelta: 44,
    health: "green",
    note: "Старт продаж · допинвестиция окупится",
  },
  {
    code: "TMR",
    name: "ЖК Тумар",
    city: "Актобе",
    phase: "Стройка",
    build: 54,
    sold: 41,
    units: 224,
    unitsLeft: 132,
    invested: 18.9,
    returned: 11.7,
    revenue: 28.5,
    margin: 22.6,
    targetMargin: 24,
    roi: 21.0,
    pace: 12,
    paceDelta: -8,
    health: "yellow",
    note: "Простой бригад давит на маржу",
  },
];

const healthMeta: Record<Health, { chip: string; dot: string; label: string; icon: LucideIcon }> = {
  green: {
    chip: "bg-success/10 text-success ring-1 ring-success/20",
    dot: "bg-success",
    label: "В плане",
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

const phaseChip: Record<Phase, string> = {
  Котлован: "bg-info/10 text-info ring-1 ring-info/20",
  Стройка: "bg-brand-soft text-accent-foreground ring-1 ring-accent/30",
  Отделка: "bg-muted text-foreground ring-1 ring-border",
  Сдан: "bg-success/10 text-success ring-1 ring-success/20",
};

function ProgressBar({
  pct,
  tone = "primary",
}: {
  pct: number;
  tone?: "primary" | "success" | "warning" | "danger" | "gold";
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const toneClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-destructive"
          : tone === "gold"
            ? "bg-linear-to-r from-accent to-warning"
            : "bg-linear-to-r from-primary to-accent";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${toneClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function DeltaChip({ v, suffix = "%" }: { v: number; suffix?: string }) {
  const up = v >= 0;
  return (
    <span
      className={`tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {v}
      {suffix}
    </span>
  );
}

function fmtBn(v: number) {
  return `${v.toFixed(1).replace(".", ",")} млрд ₸`;
}

// months for mini sales chart
const salesMonths = [
  { m: "Май", v: 1.32 },
  { m: "Июн", v: 1.48 },
  { m: "Июл", v: 1.61 },
  { m: "Авг", v: 1.42 },
  { m: "Сен", v: 1.72 },
  { m: "Окт", v: 1.84 },
  { m: "Ноя", v: 2.03 },
];

function SalesSpark() {
  const max = Math.max(...salesMonths.map((s) => s.v));
  return (
    <div className="flex h-24 items-end gap-1.5">
      {salesMonths.map((s, i) => {
        const h = Math.round((s.v / max) * 100);
        const isLast = i === salesMonths.length - 1;
        return (
          <div key={s.m} className="group flex flex-1 flex-col items-center gap-1">
            <div className="tnum text-[9px] font-bold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {s.v.toFixed(2).replace(".", ",")}
            </div>
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${
                isLast ? "bg-linear-to-t from-accent to-warning" : "bg-primary/25 group-hover:bg-primary/45"
              }`}
              style={{ height: `${h}%` }}
            />
            <div className="text-[10px] font-semibold text-muted-foreground">{s.m}</div>
          </div>
        );
      })}
    </div>
  );
}

function PortfolioPage() {
  const totalRevenue = assets.reduce((s, a) => s + a.revenue, 0);
  const totalInvested = assets.reduce((s, a) => s + a.invested, 0);
  const totalReturned = assets.reduce((s, a) => s + a.returned, 0);
  const avgMargin = assets.reduce((s, a) => s + a.margin, 0) / assets.length;
  const totalUnits = assets.reduce((s, a) => s + a.units, 0);
  const soldUnits = assets.reduce((s, a) => s + (a.units - a.unitsLeft), 0);
  const soldPct = Math.round((soldUnits / totalUnits) * 100);
  const inPlan = assets.filter((a) => a.margin >= a.targetMargin).length;
  const best = [...assets].sort((a, b) => b.roi - a.roi)[0];
  const worst = [...assets].sort((a, b) => a.roi - b.roi)[0];
  const ranked = [...assets].sort((a, b) => b.roi - a.roi);

  const profitYTD = 9.1;
  const profitPlan = 12.6;
  const profitPct = Math.round((profitYTD / profitPlan) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-foreground/70">Взгляд собственника · 2026</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Портфель собственника
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            9 ЖК как инвестиционные активы: маржа, ROI, темп продаж и деньги в обороте.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success ring-1 ring-success/20">
            <Target className="h-3.5 w-3.5" />
            {inPlan} из 9 в плане прибыли
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-accent/30">
            <BadgeDollarSign className="h-3.5 w-3.5" />
            Портфель {fmtBn(totalRevenue)}
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-foreground ring-1 ring-border">
            <Percent className="h-3.5 w-3.5" />
            Ср. маржа {avgMargin.toFixed(1).replace(".", ",")}%
          </span>
        </div>
      </div>

      {/* Cockpit — годовая цель по прибыли */}
      <section className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)" }}
        />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
              <Sparkles className="h-3.5 w-3.5" />
              Цель года · валовая прибыль
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <div className="tnum text-4xl font-extrabold tracking-tight">
                {fmtBn(profitYTD)}
              </div>
              <div className="tnum text-sm font-semibold text-muted-foreground">
                из {fmtBn(profitPlan)} · {profitPct}%
              </div>
              <DeltaChip v={11} />
            </div>
            <div className="mt-4">
              <ProgressBar pct={profitPct} tone="gold" />
              <div className="tnum mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>Прошли Q1–Q3</span>
                <span>осталось {fmtBn(profitPlan - profitYTD)} до 31.12</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Вложено
                </div>
                <div className="tnum mt-1 text-lg font-extrabold">{fmtBn(totalInvested)}</div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Возврат
                </div>
                <div className="tnum mt-1 text-lg font-extrabold text-success">
                  {fmtBn(totalReturned)}
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Продано портфеля
                </div>
                <div className="tnum mt-1 text-lg font-extrabold">{soldPct}%</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Продажи · млрд ₸ / мес
              </div>
              <DeltaChip v={11} />
            </div>
            <SalesSpark />
            <div className="tnum mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
              <span>7 мес · тренд ↑</span>
              <span>Ноя · 2,03 млрд ₸</span>
            </div>
          </div>
        </div>
      </section>

      {/* Требует решения */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Требует решения
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">3 сценария</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            to="/object"
            className="card-soft group relative overflow-hidden p-5 ring-1 ring-destructive/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-destructive" />
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                Маржа
              </span>
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Ниже целевой маржи
            </div>
            <div className="mt-0.5 text-lg font-extrabold leading-tight">ЖК Аура</div>
            <p className="tnum mt-1 text-xs text-muted-foreground">
              21,8% · цель 24% · потеря ~1,3 млрд ₸
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold">
              Разобрать объект
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/command"
            className="card-soft group relative overflow-hidden p-5 ring-1 ring-warning/25 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-warning" />
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/20 text-accent-foreground">
                <Snowflake className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                Затоварка
              </span>
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Медленные продажи
            </div>
            <div className="mt-0.5 text-lg font-extrabold leading-tight">ЖК Көктем</div>
            <p className="tnum mt-1 text-xs text-muted-foreground">
              темп −38% · 174 кв. в остатке
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold">
              Пересобрать план
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/finance"
            className="card-soft group relative overflow-hidden p-5 ring-1 ring-success/25 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-success" />
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/10 text-success">
                <Rocket className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                Возможность
              </span>
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Допинвестиция
            </div>
            <div className="mt-0.5 text-lg font-extrabold leading-tight">ЖК Алатау</div>
            <p className="tnum mt-1 text-xs text-muted-foreground">
              +1,2 млрд ₸ на отделку · ROI 29% · окупаемость 14 мес
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold">
              Смоделировать
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* KPI row */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            KPI портфеля
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">обновлено сегодня</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              label: "Прибыль YTD",
              value: fmtBn(profitYTD),
              sub: `${profitPct}% плана`,
              delta: 11,
              icon: Target,
            },
            {
              label: "Ср. маржа",
              value: `${avgMargin.toFixed(1).replace(".", ",")}%`,
              sub: "цель 24,0%",
              delta: -1,
              icon: Percent,
            },
            {
              label: "Распродано",
              value: `${soldPct}%`,
              sub: `${soldUnits} из ${totalUnits} кв.`,
              delta: 4,
              icon: TrendingUp,
            },
            {
              label: "Деньги в обороте",
              value: fmtBn(totalInvested - totalReturned),
              sub: `вложено ${fmtBn(totalInvested)}`,
              delta: 3,
              icon: Wallet,
            },
            {
              label: `Лучший ROI · ${best.code}`,
              value: `${best.roi.toFixed(1).replace(".", ",")}%`,
              sub: best.name,
              delta: 6,
              icon: Crown,
            },
            {
              label: `Худший ROI · ${worst.code}`,
              value: `${worst.roi.toFixed(1).replace(".", ",")}%`,
              sub: worst.name,
              delta: -9,
              icon: TrendingDown,
            },
          ].map((k) => (
            <div key={k.label} className="card-soft p-4">
              <div className="flex items-center justify-between">
                <span className="truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {k.label}
                </span>
                <k.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
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

      {/* Portfolio grid */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Активы · 9 ЖК
          </h2>
          <Link
            to="/command"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-foreground hover:underline"
          >
            Командный центр <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((a) => {
            const h = healthMeta[a.health];
            const marginOk = a.margin >= a.targetMargin;
            const cashCycle = Math.round((a.returned / a.invested) * 100);
            return (
              <div
                key={a.code}
                className="card-soft group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${h.dot}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-accent-foreground ring-1 ring-accent/30">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="tnum text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {a.code} · {a.city}
                      </div>
                      <div className="truncate text-base font-extrabold">{a.name}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${h.chip}`}>
                    <h.icon className="h-3 w-3" />
                    {h.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${phaseChip[a.phase]}`}>
                    {a.phase}
                  </span>
                  <span className="tnum text-[10px] font-semibold text-muted-foreground">
                    выручка {fmtBn(a.revenue)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="tnum mb-1 flex items-baseline justify-between text-[10px] font-bold">
                      <span className="uppercase tracking-wide text-muted-foreground">Стройка</span>
                      <span>{a.build}%</span>
                    </div>
                    <ProgressBar pct={a.build} tone="primary" />
                  </div>
                  <div>
                    <div className="tnum mb-1 flex items-baseline justify-between text-[10px] font-bold">
                      <span className="uppercase tracking-wide text-muted-foreground">Продано</span>
                      <span>{a.sold}%</span>
                    </div>
                    <ProgressBar pct={a.sold} tone="gold" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-muted/40 p-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Маржа
                    </div>
                    <div
                      className={`tnum text-sm font-extrabold ${marginOk ? "text-success" : "text-destructive"}`}
                    >
                      {a.margin.toFixed(1).replace(".", ",")}%
                      <span className="ml-1 text-[10px] font-semibold text-muted-foreground">
                        / {a.targetMargin}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      ROI
                    </div>
                    <div className="tnum text-sm font-extrabold">
                      {a.roi.toFixed(1).replace(".", ",")}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Остаток
                    </div>
                    <div className="tnum text-sm font-extrabold">
                      {a.unitsLeft} <span className="text-[10px] font-semibold text-muted-foreground">кв.</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Темп
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="tnum text-sm font-extrabold">{a.pace}<span className="text-[10px] font-semibold text-muted-foreground">/мес</span></div>
                      <DeltaChip v={a.paceDelta} />
                    </div>
                  </div>
                </div>

                <div className="tnum mt-3 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {fmtBn(a.invested)} вложено
                  </span>
                  <span className="text-success">
                    {fmtBn(a.returned)} возврат · {cashCycle}%
                  </span>
                </div>

                <p className="mt-2 line-clamp-1 text-[11px] text-muted-foreground">{a.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rating table */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Рейтинг доходности
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">по ROI</span>
        </div>
        <div className="card-soft overflow-hidden">
          <div className="hidden grid-cols-[40px_1.4fr_0.9fr_0.9fr_0.9fr_1fr_1fr_0.8fr] items-center gap-3 border-b border-border bg-muted/50 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground md:grid">
            <span>#</span>
            <span>Объект</span>
            <span>Фаза</span>
            <span>ROI</span>
            <span>Маржа</span>
            <span>Темп</span>
            <span>Деньги</span>
            <span className="text-right">Здоровье</span>
          </div>
          {ranked.map((a, i) => {
            const h = healthMeta[a.health];
            const marginOk = a.margin >= a.targetMargin;
            const rankIcon =
              i === 0 ? (
                <Crown className="h-3.5 w-3.5 text-warning" />
              ) : i === ranked.length - 1 ? (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              ) : null;
            return (
              <div
                key={a.code}
                className="grid grid-cols-2 items-center gap-3 border-b border-border/70 px-4 py-3 text-sm last:border-0 transition-colors hover:bg-muted/40 md:grid-cols-[40px_1.4fr_0.9fr_0.9fr_0.9fr_1fr_1fr_0.8fr]"
              >
                <div className="tnum col-span-2 flex items-center gap-2 text-xs font-bold text-muted-foreground md:col-span-1">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[11px] font-extrabold text-foreground">
                    {i + 1}
                  </span>
                  {rankIcon}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-sm font-extrabold">{a.name}</div>
                  <div className="tnum text-[11px] text-muted-foreground">
                    {a.code} · {a.city}
                  </div>
                </div>
                <div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${phaseChip[a.phase]}`}>
                    {a.phase}
                  </span>
                </div>
                <div className="tnum text-sm font-extrabold">
                  {a.roi.toFixed(1).replace(".", ",")}%
                </div>
                <div
                  className={`tnum text-sm font-bold ${marginOk ? "text-success" : "text-destructive"}`}
                >
                  {a.margin.toFixed(1).replace(".", ",")}%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="tnum text-sm font-semibold">{a.pace}/мес</span>
                  <DeltaChip v={a.paceDelta} />
                </div>
                <div className="tnum text-[11px] text-muted-foreground">
                  <span className="font-bold text-foreground">{fmtBn(a.invested)}</span> →{" "}
                  <span className="text-success">{fmtBn(a.returned)}</span>
                </div>
                <div className="flex md:justify-end">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${h.chip}`}>
                    <h.icon className="h-3 w-3" />
                    {h.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Свод по компании */}
      <section className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 60%)" }}
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
                Свод по компании
              </div>
              <div className="tnum mt-0.5 text-lg font-extrabold">
                {inPlan}/9 в плане · {avgMargin.toFixed(1).replace(".", ",")}% ср. маржа · портфель {fmtBn(totalRevenue)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Пять активов зелёных, три требуют внимания, один в риске. Основной драйвер квартала — ЖК Жұлдыз и ЖК Нұрсая.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/command"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Командный центр <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/finance"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-ring"
            >
              Финансы и акты
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
