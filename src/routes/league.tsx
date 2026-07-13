import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
  ClipboardCheck,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Rocket,
  Heart,
  ArrowRight,
  TrendingUp,
  HardHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/league")({
  head: () => ({
    meta: [
      { title: "Лига участков — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Соревнование участков: дивизионы, подиум, очки за темп ГПР, качество, безопасность и обеспеченность.",
      },
      { property: "og:title", content: "Лига участков — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Соревнование участков: дивизионы, подиум, очки за темп ГПР, качество, безопасность и обеспеченность.",
      },
    ],
  }),
  component: LeaguePage,
});

type Division = "gold" | "silver" | "bronze";

interface Site {
  code: string;
  name: string;
  project: string;
  foreman: string;
  division: Division;
  points: number;
  delta: number;
  streak: number;
  pace: number;
  quality: number;
  safety: number;
  supply: number;
  incidents: number;
  qc: number;
  onTime: number;
  note: string;
  isYou?: boolean;
}

const sites: Site[] = [
  {
    code: "ZHL-1",
    name: "Участок Жұлдыз-1",
    project: "ЖК Жұлдыз",
    foreman: "Ержан К.",
    division: "gold",
    points: 948,
    delta: 1,
    streak: 6,
    pace: 94,
    quality: 92,
    safety: 100,
    supply: 88,
    incidents: 0,
    qc: 2,
    onTime: 96,
    note: "3 работы крит. пути закрыты досрочно",
  },
  {
    code: "NRS-A",
    name: "Участок Нұрсая-А",
    project: "ЖК Нұрсая",
    foreman: "Динара М.",
    division: "gold",
    points: 912,
    delta: 0,
    streak: 4,
    pace: 88,
    quality: 96,
    safety: 100,
    supply: 82,
    incidents: 0,
    qc: 1,
    onTime: 91,
    note: "Меньше всех замечаний ПТО в квартале",
  },
  {
    code: "AUR-1",
    name: "Участок Аура-Блок 1",
    project: "ЖК Аура",
    foreman: "Данияр А.",
    division: "gold",
    points: 864,
    delta: 2,
    streak: 2,
    pace: 82,
    quality: 84,
    safety: 100,
    supply: 90,
    incidents: 0,
    qc: 4,
    onTime: 85,
    note: "Рывок недели · +48 очков",
    isYou: true,
  },
  {
    code: "ATM-A",
    name: "Участок Атмосфера-А",
    project: "ЖК Атмосфера",
    foreman: "Тимур Б.",
    division: "silver",
    points: 798,
    delta: -1,
    streak: 0,
    pace: 78,
    quality: 82,
    safety: 92,
    supply: 86,
    incidents: 1,
    qc: 5,
    onTime: 79,
    note: "Стабильно · без риска",
  },
  {
    code: "KKT-2",
    name: "Участок Көктем-2",
    project: "ЖК Көктем",
    foreman: "Кайрат Б.",
    division: "silver",
    points: 742,
    delta: 3,
    streak: 0,
    pace: 74,
    quality: 80,
    safety: 96,
    supply: 78,
    incidents: 0,
    qc: 6,
    onTime: 76,
    note: "Хороший рост темпа за 2 недели",
  },
  {
    code: "ARM-B",
    name: "Участок Арман-Б",
    project: "ЖК Арман",
    foreman: "Алия Ж.",
    division: "silver",
    points: 708,
    delta: -2,
    streak: 0,
    pace: 72,
    quality: 78,
    safety: 94,
    supply: 74,
    incidents: 1,
    qc: 7,
    onTime: 72,
    note: "Провалы по обеспечению — держим в фокусе",
  },
  {
    code: "TMR-1",
    name: "Участок Тумар-1",
    project: "ЖК Тумар",
    foreman: "Тимур Б.",
    division: "bronze",
    points: 612,
    delta: 1,
    streak: 0,
    pace: 62,
    quality: 70,
    safety: 88,
    supply: 66,
    incidents: 2,
    qc: 10,
    onTime: 62,
    note: "Зона роста · темп ГПР",
  },
  {
    code: "SLM-2",
    name: "Участок Салтанат-2",
    project: "ЖК Салтанат",
    foreman: "Кайрат Б.",
    division: "bronze",
    points: 564,
    delta: -3,
    streak: 0,
    pace: 58,
    quality: 66,
    safety: 84,
    supply: 62,
    incidents: 2,
    qc: 12,
    onTime: 58,
    note: "Зона роста · качество и обеспечение",
  },
  {
    code: "ALA-K",
    name: "Участок Алатау-Котлован",
    project: "ЖК Алатау",
    foreman: "Данияр А.",
    division: "bronze",
    points: 508,
    delta: 4,
    streak: 0,
    pace: 54,
    quality: 72,
    safety: 90,
    supply: 58,
    incidents: 1,
    qc: 8,
    onTime: 55,
    note: "Молодой участок · растёт быстрее всех",
  },
];

const divisionMeta: Record<
  Division,
  { label: string; chip: string; ring: string; from: string; icon: LucideIcon }
> = {
  gold: {
    label: "Золотая",
    chip: "bg-linear-to-r from-warning to-accent text-primary",
    ring: "ring-warning/40",
    from: "from-warning to-accent",
    icon: Crown,
  },
  silver: {
    label: "Серебряная",
    chip: "bg-linear-to-r from-muted to-secondary text-foreground",
    ring: "ring-muted-foreground/30",
    from: "from-muted-foreground/30 to-secondary",
    icon: Medal,
  },
  bronze: {
    label: "Бронзовая",
    chip: "bg-linear-to-r from-accent/60 to-brand-soft text-accent-foreground",
    ring: "ring-accent/30",
    from: "from-accent/50 to-brand-soft",
    icon: Shield,
  },
};

interface Factor {
  key: "pace" | "quality" | "safety" | "supply";
  label: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "info";
}

const factors: Factor[] = [
  { key: "pace", label: "Темп ГПР", icon: Zap, tone: "primary" },
  { key: "quality", label: "Качество", icon: ClipboardCheck, tone: "success" },
  { key: "safety", label: "Безопасность", icon: ShieldCheck, tone: "info" },
  { key: "supply", label: "Обеспечение", icon: Package, tone: "warning" },
];

function DeltaBadge({ v }: { v: number }) {
  if (v === 0) {
    return (
      <span className="tnum inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
        <Minus className="h-3 w-3" /> 0
      </span>
    );
  }
  const up = v > 0;
  return (
    <span
      className={`tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {v}
    </span>
  );
}

function FactorBar({ v, tone }: { v: number; tone: Factor["tone"] }) {
  const cls =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "info"
          ? "bg-info"
          : "bg-linear-to-r from-primary to-accent";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${cls}`}
        style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
      />
    </div>
  );
}

function LeaguePage() {
  const [division, setDivision] = useState<Division | "ALL">("ALL");

  const ranked = useMemo(() => [...sites].sort((a, b) => b.points - a.points), []);
  const podium = ranked.slice(0, 3);
  const filtered = useMemo(
    () => (division === "ALL" ? ranked : ranked.filter((s) => s.division === division)),
    [division, ranked],
  );

  const you = ranked.find((s) => s.isYou);
  const yourPos = you ? ranked.findIndex((s) => s.code === you.code) + 1 : 0;
  const ahead = you && yourPos > 1 ? ranked[yourPos - 2] : null;
  const pointsToPromote = ahead && you ? ahead.points - you.points : 0;

  const bestPace = [...ranked].sort((a, b) => b.pace - a.pace)[0];
  const bestQuality = [...ranked].sort((a, b) => b.quality - a.quality)[0];
  const bestJump = [...ranked].sort((a, b) => b.delta - a.delta)[0];

  const rewards: {
    title: string;
    subtitle: string;
    site: Site;
    icon: LucideIcon;
    tone: "gold" | "success" | "info";
  }[] = [
    {
      title: "Лучший темп",
      subtitle: `Темп ГПР ${bestPace.pace}%`,
      site: bestPace,
      icon: Rocket,
      tone: "gold",
    },
    {
      title: "Чистое качество",
      subtitle: `Всего ${bestQuality.qc} замечаний ПТО`,
      site: bestQuality,
      icon: Shield,
      tone: "success",
    },
    {
      title: "Рывок месяца",
      subtitle: `+${bestJump.delta} позиций`,
      site: bestJump,
      icon: TrendingUp,
      tone: "info",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-foreground/70">
            Соревнование участков · неделя 46
          </p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Лига участков
            <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground ring-1 ring-accent/30">
              вместе строим
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Очки складываются из темпа ГПР, качества, безопасности и обеспечения — реальные метрики
            участка.
          </p>
        </div>
        {you && (
          <div className="card-soft flex items-center gap-3 p-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <div className="tnum text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Ваша позиция
              </div>
              <div className="tnum text-lg font-extrabold">
                #{yourPos} · {you.points} XP
                <span className="ml-2 text-[11px] font-semibold text-muted-foreground">
                  до #{Math.max(1, yourPos - 1)} — {pointsToPromote} XP
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Division tabs */}
      <section className="flex flex-wrap items-center gap-2">
        <div className="mr-1 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Дивизион:
        </div>
        {(["ALL", "gold", "silver", "bronze"] as const).map((d) => {
          const label = d === "ALL" ? "Все" : divisionMeta[d].label;
          const count = d === "ALL" ? sites.length : sites.filter((s) => s.division === d).length;
          const active = division === d;
          const Ic = d === "ALL" ? null : divisionMeta[d].icon;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDivision(d)}
              className={`tnum inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-ring"
              }`}
            >
              {Ic && <Ic className="h-3.5 w-3.5" />}
              {label}
              <span
                className={`ml-1 rounded-full px-1.5 py-0 text-[10px] font-bold ${active ? "bg-primary-foreground/20" : "bg-muted"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </section>

      {/* Podium */}
      <section className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)" }}
        />
        <div className="relative mb-5 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Подиум недели
          </h2>
        </div>

        <div className="relative grid gap-3 md:grid-cols-3 md:items-end">
          {[podium[1], podium[0], podium[2]].map((s, i) => {
            if (!s) return null;
            const place = ranked.findIndex((r) => r.code === s.code) + 1;
            const isFirst = place === 1;
            const heightCls = isFirst ? "md:h-56" : place === 2 ? "md:h-48" : "md:h-40";
            const isYou = s.isYou;
            return (
              <div
                key={s.code}
                className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${heightCls} ${
                  isFirst
                    ? "border-warning/40 bg-linear-to-br from-warning/20 via-accent/20 to-brand-soft"
                    : place === 2
                      ? "border-border bg-linear-to-br from-muted to-secondary"
                      : "border-border bg-linear-to-br from-brand-soft/70 to-background"
                } ${isYou ? "ring-2 ring-primary" : ""}`}
                style={{ order: i }}
              >
                <div className="absolute right-3 top-3">
                  {isFirst ? (
                    <Crown className="h-6 w-6 text-warning drop-shadow" />
                  ) : place === 2 ? (
                    <Medal className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Medal className="h-5 w-5 text-accent-foreground" />
                  )}
                </div>
                <div className="tnum text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  #{place} место
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-lg font-extrabold leading-tight">{s.name}</div>
                  {isYou && (
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary-foreground">
                      вы
                    </span>
                  )}
                </div>
                <div className="tnum text-[11px] text-muted-foreground">
                  {s.project} · {s.foreman}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className="tnum text-3xl font-extrabold">{s.points}</div>
                  <div className="text-xs font-semibold text-muted-foreground">XP</div>
                  <div className="ml-auto">
                    <DeltaBadge v={s.delta} />
                  </div>
                </div>
                <div className="tnum mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-3 w-3 text-warning" /> streak {s.streak}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Zap className="h-3 w-3" /> темп {s.pace}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {s.incidents} инц.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rewards */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Награды недели
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">
            присуждается автоматически
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {rewards.map((r) => {
            const toneWrap =
              r.tone === "gold"
                ? "bg-linear-to-br from-warning/20 to-accent/20 ring-warning/30"
                : r.tone === "success"
                  ? "bg-linear-to-br from-success/15 to-brand-soft ring-success/25"
                  : "bg-linear-to-br from-info/15 to-brand-soft ring-info/25";
            return (
              <div
                key={r.title}
                className={`card-soft group relative overflow-hidden p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg ${toneWrap}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-background/70 text-accent-foreground shadow-sm">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <Sparkles className="h-4 w-4 text-warning" />
                </div>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {r.title}
                </div>
                <div className="text-lg font-extrabold leading-tight">{r.site.name}</div>
                <div className="tnum text-[11px] text-muted-foreground">
                  {r.site.foreman} · {r.subtitle}
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-bold">
                  +150 XP команде
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Standings table */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Турнирная таблица
          </h2>
          <span className="tnum text-[11px] font-semibold text-muted-foreground">
            {filtered.length} участков
          </span>
        </div>
        <div className="card-soft overflow-hidden">
          <div className="hidden grid-cols-[40px_1.6fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr_0.6fr] gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground md:grid">
            <span>#</span>
            <span>Участок</span>
            <span>Дивизион</span>
            <span>Темп</span>
            <span>Качество</span>
            <span>Безоп.</span>
            <span>Снабж.</span>
            <span>Очки</span>
            <span className="text-right">Δ</span>
          </div>
          {filtered.map((s) => {
            const place = ranked.findIndex((r) => r.code === s.code) + 1;
            const dm = divisionMeta[s.division];
            return (
              <div
                key={s.code}
                className={`grid grid-cols-2 items-center gap-3 border-b border-border/70 px-4 py-3 text-sm transition-colors last:border-0 md:grid-cols-[40px_1.6fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr_0.6fr] ${
                  s.isYou ? "bg-brand-soft/60" : "hover:bg-muted/40"
                }`}
              >
                <div className="tnum col-span-2 flex items-center gap-2 md:col-span-1">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-extrabold ${
                      place <= 3
                        ? "bg-linear-to-br from-warning to-accent text-primary"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {place}
                  </span>
                  {place === 1 && <Crown className="h-3.5 w-3.5 text-warning" />}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-extrabold">{s.name}</div>
                    {s.isYou && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary-foreground">
                        вы
                      </span>
                    )}
                    {s.streak > 0 && (
                      <span className="tnum inline-flex items-center gap-0.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                        <Flame className="h-3 w-3" />
                        {s.streak}
                      </span>
                    )}
                  </div>
                  <div className="tnum text-[10px] text-muted-foreground">
                    {s.project} · {s.foreman}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${dm.chip} ring-1 ${dm.ring}`}
                  >
                    <dm.icon className="h-3 w-3" />
                    {dm.label}
                  </span>
                </div>
                <div className="tnum text-sm font-bold">{s.pace}%</div>
                <div className="tnum text-sm font-bold">{s.quality}%</div>
                <div className="tnum text-sm font-bold text-success">
                  {s.safety}%
                  {s.incidents === 0 && (
                    <span className="ml-1 text-[9px] font-semibold text-success">·0 инц.</span>
                  )}
                </div>
                <div className="tnum text-sm font-bold">{s.supply}%</div>
                <div className="tnum text-sm font-extrabold">{s.points}</div>
                <div className="flex md:justify-end">
                  <DeltaBadge v={s.delta} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              В этом дивизионе нет участков.
            </div>
          )}
        </div>
      </section>

      {/* Site cards with breakdown */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Раскладка очков
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">по факторам</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const place = ranked.findIndex((r) => r.code === s.code) + 1;
            const dm = divisionMeta[s.division];
            const lowest = factors.reduce(
              (min, f) => (s[f.key] < s[min.key] ? f : min),
              factors[0],
            );
            const weakest = s[lowest.key] < 70;
            return (
              <div
                key={s.code}
                className={`card-soft group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  s.isYou ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${dm.from}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl ${
                        place <= 3
                          ? "bg-linear-to-br from-warning to-accent text-primary"
                          : "bg-brand-soft text-accent-foreground ring-1 ring-accent/30"
                      }`}
                    >
                      <span className="tnum text-sm font-extrabold">#{place}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="truncate text-base font-extrabold">{s.name}</div>
                        {s.isYou && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary-foreground">
                            вы
                          </span>
                        )}
                      </div>
                      <div className="tnum text-[10px] text-muted-foreground">
                        {s.project} · {s.foreman}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${dm.chip} ring-1 ${dm.ring}`}
                  >
                    <dm.icon className="h-3 w-3" />
                    {dm.label}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="tnum text-3xl font-extrabold">{s.points}</div>
                  <div className="flex items-center gap-2">
                    <DeltaBadge v={s.delta} />
                    <span className="tnum text-[10px] font-semibold text-muted-foreground">
                      онтайм {s.onTime}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {factors.map((f) => (
                    <div key={f.key}>
                      <div className="tnum mb-1 flex items-center justify-between text-[11px]">
                        <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                          <f.icon className="h-3 w-3" />
                          {f.label}
                        </span>
                        <span className="font-extrabold">{s[f.key]}%</span>
                      </div>
                      <FactorBar v={s[f.key]} tone={f.tone} />
                    </div>
                  ))}
                </div>

                {weakest ? (
                  <div className="mt-4 rounded-xl border border-dashed border-accent/40 bg-brand-soft/60 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      Зона роста
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Подтянуть{" "}
                      <span className="font-bold text-foreground">
                        {lowest.label.toLowerCase()}
                      </span>{" "}
                      · {s.note}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-success/25 bg-success/5 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-success">
                      <Sparkles className="h-3.5 w-3.5" />
                      Сильная сторона
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{s.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Fair-play footer */}
      <section className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full opacity-60 blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--color-primary) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
                Правила лиги
              </div>
              <div className="tnum mt-0.5 text-lg font-extrabold">
                Соревнуемся за метрики, помогаем отстающим · fair play
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                За менторство участка из «зоны роста» бригадир получает +200 XP. Штрафов «против
                последних» — нет.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/rp"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Пульт РП <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/foreman"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-ring"
            >
              Напарник мастера
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
