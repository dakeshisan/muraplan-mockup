import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Activity,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Camera,
  HardHat,
  ShieldCheck,
  Sparkles,
  Layers,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Users,
  Wrench,
  ClipboardCheck,
  Trophy,
  Zap,
  Shield,
  Route as RouteIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/object")({
  head: () => ({
    meta: [
      { title: "Разбор объекта — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Deep-dive ЖК Аура: тепловая карта блоков и этажей, фронты, проблемы, фото-прогресс и команда объекта.",
      },
      { property: "og:title", content: "Разбор объекта — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Deep-dive ЖК Аура: тепловая карта блоков и этажей, фронты, проблемы, фото-прогресс и команда объекта.",
      },
    ],
  }),
  component: ObjectPage,
});

type BlockKey = "B1" | "B2" | "B3" | "B4";

interface FloorCell {
  floor: number;
  ready: number; // %
  status: "done" | "progress" | "risk" | "late" | "empty";
  note?: string;
}

interface Block {
  key: BlockKey;
  title: string;
  phase: string;
  ready: number;
  floors: FloorCell[];
  crew: number;
  brigades: number;
  foreman: string;
  delta: number; // days
  fronts: Front[];
}

interface Front {
  name: string;
  who: string;
  ready: number;
  plan: string;
  status: "green" | "yellow" | "red" | "done";
}

const makeFloors = (spec: Array<[number, FloorCell["status"], number, string?]>): FloorCell[] =>
  spec.map(([floor, status, ready, note]) => ({ floor, status, ready, note }));

const blocks: Block[] = [
  {
    key: "B1",
    title: "Блок 1 · отделка",
    phase: "Внутренняя отделка",
    ready: 74,
    crew: 62,
    brigades: 4,
    foreman: "Динара М.",
    delta: 2,
    floors: makeFloors([
      [9, "progress", 40, "Штукатурка"],
      [8, "progress", 55, "Штукатурка"],
      [7, "progress", 70, "Стяжка"],
      [6, "progress", 80, "Стяжка"],
      [5, "risk", 60, "Замечание ПТО"],
      [4, "done", 100, "Приёмка ок"],
      [3, "done", 100, "Приёмка ок"],
      [2, "done", 100, "Приёмка ок"],
      [1, "done", 100, "Приёмка ок"],
    ]),
    fronts: [
      { name: "Штукатурка стен", who: "Динара М.", ready: 62, plan: "к 20.11", status: "green" },
      { name: "Стяжка полов", who: "Кайрат Б.", ready: 78, plan: "к 15.11", status: "green" },
      { name: "Разводка электрики", who: "Алия Ж.", ready: 55, plan: "к 22.11", status: "yellow" },
      {
        name: "Устранение замечаний, 5 эт.",
        who: "Динара М.",
        ready: 40,
        plan: "к 12.11",
        status: "red",
      },
    ],
  },
  {
    key: "B2",
    title: "Блок 2 · кладка + сети",
    phase: "Кладка / ВК",
    ready: 58,
    crew: 48,
    brigades: 3,
    foreman: "Тимур Б.",
    delta: -4,
    floors: makeFloors([
      [9, "empty", 0],
      [8, "empty", 0],
      [7, "empty", 0],
      [6, "progress", 20, "Кладка старт"],
      [5, "progress", 55, "Кладка"],
      [4, "risk", 66, "Отставание"],
      [3, "progress", 82, "Кладка+ВК"],
      [2, "done", 100],
      [1, "done", 100],
    ]),
    fronts: [
      { name: "Кладка стен, 4 эт.", who: "Тимур Б.", ready: 66, plan: "к 12.11", status: "red" },
      { name: "Кладка стен, 5 эт.", who: "Тимур Б.", ready: 55, plan: "к 18.11", status: "yellow" },
      {
        name: "Внутренние сети ВК",
        who: "Кайрат Б.",
        ready: 34,
        plan: "к 25.11",
        status: "yellow",
      },
    ],
  },
  {
    key: "B3",
    title: "Блок 3 · монолит",
    phase: "Монолит",
    ready: 44,
    crew: 58,
    brigades: 4,
    foreman: "Ержан К.",
    delta: -12,
    floors: makeFloors([
      [9, "empty", 0],
      [8, "empty", 0],
      [7, "late", 20, "Крит. отставание"],
      [6, "risk", 50, "Лифт. шахта"],
      [5, "progress", 82, "Колонны"],
      [4, "done", 100],
      [3, "done", 100],
      [2, "done", 100],
      [1, "done", 100],
    ]),
    fronts: [
      { name: "Заливка колонн, 7 эт.", who: "Ержан К.", ready: 20, plan: "к 14.11", status: "red" },
      { name: "Монтаж лифт. шахты", who: "Ержан К.", ready: 55, plan: "к 20.11", status: "red" },
      {
        name: "Демонтаж опалубки, 5 эт.",
        who: "Ержан К.",
        ready: 90,
        plan: "10.11",
        status: "green",
      },
    ],
  },
  {
    key: "B4",
    title: "Блок 4 · паркинг",
    phase: "Подземный",
    ready: 47,
    crew: 22,
    brigades: 2,
    foreman: "Данияр А.",
    delta: 1,
    floors: makeFloors([
      [0, "progress", 47, "Гидроизоляция"],
      [-1, "progress", 62, "Плита низа"],
      [-2, "done", 100, "Земляные"],
    ]),
    fronts: [
      {
        name: "Гидроизоляция плиты",
        who: "Данияр А.",
        ready: 47,
        plan: "к 24.11",
        status: "green",
      },
      { name: "Приямки лифтов", who: "Данияр А.", ready: 62, plan: "к 22.11", status: "green" },
    ],
  },
];

type ProblemStatus = "Открыто" | "В работе" | "На переделке" | "Закрыто";
type Priority = "high" | "mid" | "low";

interface Problem {
  id: string;
  title: string;
  where: string;
  who: string;
  age: string;
  status: ProblemStatus;
  priority: Priority;
  kind: "safety" | "quality" | "plan" | "supply";
}

const problems: Problem[] = [
  {
    id: "PR-042",
    title: "Арматура пришла с задержкой на 4 дня",
    where: "Блок 3 · монолит 7 эт.",
    who: "Ержан К.",
    age: "3 дня",
    status: "В работе",
    priority: "high",
    kind: "supply",
  },
  {
    id: "PR-041",
    title: "Стяжка вне класса прочности, ~120 м²",
    where: "Блок 1 · п.2, 5 эт.",
    who: "Динара М.",
    age: "2 дня",
    status: "На переделке",
    priority: "high",
    kind: "quality",
  },
  {
    id: "PR-039",
    title: "Кладка отклонение по вертикали, ось Б",
    where: "Блок 2 · п.1, 3 эт.",
    who: "Тимур Б.",
    age: "1 день",
    status: "В работе",
    priority: "mid",
    kind: "quality",
  },
  {
    id: "PR-037",
    title: "Каска не по норме у сварщика, замечание СОТ",
    where: "Блок 3 · площадка",
    who: "Ержан К.",
    age: "вчера",
    status: "Закрыто",
    priority: "low",
    kind: "safety",
  },
  {
    id: "PR-035",
    title: "Сдвиг заливки колонн из-за арматуры",
    where: "Блок 3 · 7 эт.",
    who: "Ержан К.",
    age: "3 дня",
    status: "Открыто",
    priority: "high",
    kind: "plan",
  },
];

const problemStatusChip: Record<ProblemStatus, string> = {
  Открыто: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  "В работе": "bg-warning/15 text-accent-foreground ring-1 ring-warning/30",
  "На переделке": "bg-info/10 text-info ring-1 ring-info/20",
  Закрыто: "bg-success/10 text-success ring-1 ring-success/20",
};

const priorityMeta: Record<Priority, { label: string; chip: string }> = {
  high: { label: "Срочно", chip: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  mid: { label: "План", chip: "bg-brand-soft text-accent-foreground ring-1 ring-accent/30" },
  low: { label: "Фон", chip: "bg-muted text-muted-foreground ring-1 ring-border" },
};

const kindMeta: Record<Problem["kind"], { label: string; icon: LucideIcon }> = {
  safety: { label: "Безопасность", icon: ShieldCheck },
  quality: { label: "Качество", icon: ClipboardCheck },
  plan: { label: "Планирование", icon: RouteIcon },
  supply: { label: "Снабжение", icon: Wrench },
};

const photoProgress = [
  { date: "01 окт", label: "Монолит, 5 эт.", tag: "Блок 3" },
  { date: "15 окт", label: "Кладка 3 эт.", tag: "Блок 2" },
  { date: "24 окт", label: "Стяжка 4 эт.", tag: "Блок 1" },
  { date: "05 ноя", label: "Колонны 7 эт.", tag: "Блок 3" },
  { date: "11 ноя", label: "Отделка МОП", tag: "Блок 1" },
  { date: "сегодня", label: "Приёмка окон", tag: "Блок 1" },
];

interface Achievement {
  title: string;
  desc: string;
  icon: LucideIcon;
  unlocked: boolean;
  progress?: string;
}

const achievements: Achievement[] = [
  { title: "Ноль ЧП", desc: "60 дней без нарушений СОТ", icon: Shield, unlocked: true },
  { title: "Ритм квартала", desc: "3 месяца стройка в план", icon: Zap, unlocked: true },
  {
    title: "Чистый ПТО",
    desc: "≤5 замечаний за месяц",
    icon: ClipboardCheck,
    unlocked: false,
    progress: "6/5",
  },
  {
    title: "Возвращение критики",
    desc: "Закрыть 4 работы крит. пути в срок",
    icon: RouteIcon,
    unlocked: false,
    progress: "2/4",
  },
];

function heatBg(
  ready: number,
  status: FloorCell["status"],
): { bg: string; text: string; ring: string } {
  if (status === "empty") {
    return { bg: "bg-muted/40", text: "text-muted-foreground/60", ring: "ring-border" };
  }
  if (status === "late") {
    return {
      bg: "bg-destructive/85",
      text: "text-destructive-foreground",
      ring: "ring-destructive/40",
    };
  }
  if (status === "risk") {
    return { bg: "bg-warning/70", text: "text-primary", ring: "ring-warning/40" };
  }
  if (status === "done") {
    return { bg: "bg-success/70", text: "text-success-foreground", ring: "ring-success/40" };
  }
  // progress — interpolate opacity by %
  if (ready >= 75) return { bg: "bg-success/45", text: "text-foreground", ring: "ring-success/25" };
  if (ready >= 50)
    return { bg: "bg-accent/50", text: "text-accent-foreground", ring: "ring-accent/25" };
  if (ready >= 25)
    return { bg: "bg-brand-soft", text: "text-accent-foreground", ring: "ring-accent/20" };
  return { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-border" };
}

const frontStatusChip: Record<Front["status"], string> = {
  green: "bg-success/10 text-success ring-1 ring-success/20",
  yellow: "bg-warning/15 text-accent-foreground ring-1 ring-warning/30",
  red: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  done: "bg-muted text-muted-foreground ring-1 ring-border",
};

const frontStatusLabel: Record<Front["status"], string> = {
  green: "В срок",
  yellow: "Риск",
  red: "Просрочка",
  done: "Готово",
};

function ObjectPage() {
  const [selected, setSelected] = useState<BlockKey>("B3");
  const block = blocks.find((b) => b.key === selected)!;

  const overall = useMemo(() => {
    const readySum = blocks.reduce((s, b) => s + b.ready, 0);
    return Math.round(readySum / blocks.length);
  }, []);

  const openProblems = problems.filter((p) => p.status !== "Закрыто").length;
  const health = 68; // 0..100 rollup

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-foreground/70">
            Разбор объекта · сегодня
          </p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            ЖК Аура
            <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground ring-1 ring-accent/30">
              Алматы · 4 блока
            </span>
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> мкр. Достык · РП Данияр А. · 190 человек на площадке
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-warning/30">
            <Activity className="h-3.5 w-3.5" />
            Здоровье {health}%
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-accent/30">
            <Building2 className="h-3.5 w-3.5" />
            Готовность {overall}%
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive ring-1 ring-destructive/20">
            <Flame className="h-3.5 w-3.5" />
            {openProblems} проблем
          </span>
        </div>
      </div>

      {/* Cockpit ribbon */}
      <section className="card-soft grid gap-3 p-4 md:grid-cols-5">
        {[
          {
            label: "Здоровье",
            value: `${health}%`,
            sub: "цель 80%",
            tone: "warning" as const,
            icon: Activity,
          },
          {
            label: "Готовность стройки",
            value: `${overall}%`,
            sub: "средневзвешенно",
            tone: "primary" as const,
            icon: Building2,
          },
          {
            label: "Продано",
            value: "64%",
            sub: "264 из 412 кв.",
            tone: "gold" as const,
            icon: ArrowUpRight,
          },
          {
            label: "Открытых проблем",
            value: `${openProblems}`,
            sub: "закрыто 34 за неделю",
            tone: "danger" as const,
            icon: AlertTriangle,
          },
          {
            label: "Streak безопасности",
            value: "60 дн.",
            sub: "рекорд 74",
            tone: "success" as const,
            icon: ShieldCheck,
          },
        ].map((k) => (
          <div key={k.label} className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </span>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="tnum mt-1 text-2xl font-extrabold">{k.value}</div>
            <div className="tnum text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </section>

      {/* Требует внимания */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Требует внимания
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">3 приоритета</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="card-soft relative overflow-hidden p-5 ring-1 ring-destructive/25">
            <div className="absolute inset-x-0 top-0 h-1 bg-destructive" />
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Flame className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                Блокер
              </span>
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Задержка арматуры
            </div>
            <div className="text-lg font-extrabold leading-tight">Блок 3 · монолит 7 эт.</div>
            <p className="tnum mt-1 text-xs text-muted-foreground">
              −4 дня к плану заливки · Ержан К.
            </p>
            <button
              type="button"
              onClick={() => setSelected("B3")}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold"
            >
              Открыть блок <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="card-soft relative overflow-hidden p-5 ring-1 ring-warning/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-warning" />
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/20 text-accent-foreground">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                Отставание
              </span>
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Кладка 4 эт.
            </div>
            <div className="text-lg font-extrabold leading-tight">Блок 2 · Тимур Б.</div>
            <p className="tnum mt-1 text-xs text-muted-foreground">
              −4 дня · требуется усиление бригады
            </p>
            <button
              type="button"
              onClick={() => setSelected("B2")}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold"
            >
              Разобрать <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="card-soft relative overflow-hidden p-5 ring-1 ring-info/25">
            <div className="absolute inset-x-0 top-0 h-1 bg-info" />
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-info/10 text-info">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-bold uppercase text-info">
                Качество
              </span>
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Стяжка вне класса
            </div>
            <div className="text-lg font-extrabold leading-tight">Блок 1 · п.2, 5 эт.</div>
            <p className="tnum mt-1 text-xs text-muted-foreground">Переделка ~120 м² · Динара М.</p>
            <button
              type="button"
              onClick={() => setSelected("B1")}
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold"
            >
              Открыть блок <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Heatmap + selected block */}
      <section className="grid gap-3 xl:grid-cols-[1.3fr_1fr]">
        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Карта блоков · этажи
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              выбор блока показывает фронты
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {blocks.map((b) => {
              const isActive = selected === b.key;
              const late = b.delta < 0;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setSelected(b.key)}
                  className={`group flex flex-col items-stretch rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isActive
                      ? "border-primary bg-brand-soft/70 shadow-md"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-lg text-[11px] font-extrabold ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                      >
                        {b.key}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">{b.title}</div>
                        <div className="tnum text-[10px] text-muted-foreground">{b.phase}</div>
                      </div>
                    </div>
                    <span
                      className={`tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        late ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                      }`}
                    >
                      {late ? "" : "+"}
                      {b.delta} дн.
                    </span>
                  </div>

                  {/* floors grid */}
                  <div className="mt-3 flex flex-col gap-1">
                    {b.floors.map((f) => {
                      const st = heatBg(f.ready, f.status);
                      return (
                        <div
                          key={f.floor}
                          className={`tnum flex items-center justify-between rounded-md px-2 py-1 text-[10px] font-bold ring-1 transition-transform group-hover:scale-[1.01] ${st.bg} ${st.text} ${st.ring}`}
                          title={f.note}
                        >
                          <span>
                            {f.floor <= 0 ? (f.floor === 0 ? "0" : `${f.floor}`) : `${f.floor} эт.`}
                          </span>
                          <span>{f.ready}%</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="tnum mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {b.crew} чел.
                    </span>
                    <span className="font-extrabold text-foreground">{b.ready}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-muted/40 ring-1 ring-border" /> ещё не начат
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-brand-soft ring-1 ring-accent/20" /> старт
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-accent/50 ring-1 ring-accent/25" /> в работе
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-warning/70 ring-1 ring-warning/40" /> риск
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-destructive/85 ring-1 ring-destructive/40" />{" "}
              отставание
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-sm bg-success/70 ring-1 ring-success/40" /> готово
            </span>
          </div>
        </div>

        {/* Selected block detail */}
        <div className="card-soft flex flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                {block.key} · выбранный блок
              </div>
              <div className="mt-0.5 text-lg font-extrabold leading-tight">{block.title}</div>
              <div className="tnum mt-0.5 text-[11px] text-muted-foreground">
                {block.phase} · {block.brigades} бригад · {block.crew} чел.
              </div>
            </div>
            <div className="text-right">
              <div className="tnum text-3xl font-extrabold">{block.ready}%</div>
              <div className="tnum text-[11px] text-muted-foreground">готовность</div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="tnum inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold ring-1 ring-accent/30">
              <HardHat className="h-3 w-3" /> {block.foreman}
            </span>
            <span
              className={`tnum inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                block.delta < 0
                  ? "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
                  : "bg-success/10 text-success ring-1 ring-success/20"
              }`}
            >
              {block.delta < 0 ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {block.delta < 0 ? "" : "+"}
              {block.delta} дн. к плану
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
              Фронты работ
            </div>
            {block.fronts.map((f) => (
              <div
                key={f.name}
                className="rounded-xl border border-border bg-background/70 p-3 transition-colors hover:border-ring"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold">{f.name}</div>
                    <div className="tnum text-[10px] text-muted-foreground">
                      {f.who} · {f.plan}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${frontStatusChip[f.status]}`}
                  >
                    {frontStatusLabel[f.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        f.status === "red"
                          ? "bg-destructive"
                          : f.status === "yellow"
                            ? "bg-warning"
                            : f.status === "done"
                              ? "bg-muted-foreground/50"
                              : "bg-linear-to-r from-primary to-accent"
                      }`}
                      style={{ width: `${f.ready}%` }}
                    />
                  </div>
                  <span className="tnum w-9 text-right text-[11px] font-extrabold">{f.ready}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Проблемы + фото-прогресс */}
      <section className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Проблемы объекта
            </h3>
            <span className="tnum text-[11px] font-semibold text-muted-foreground">
              {openProblems} открытых · {problems.length - openProblems} закрыто
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {problems.map((p) => {
              const K = kindMeta[p.kind];
              const pr = priorityMeta[p.priority];
              return (
                <div
                  key={p.id}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-background/70 p-3 transition-colors hover:border-ring"
                >
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <Camera className="h-5 w-5" />
                    <span
                      className={`absolute -left-1 -top-1 grid h-4 w-4 place-items-center rounded-full ring-2 ring-card ${
                        p.priority === "high"
                          ? "bg-destructive text-destructive-foreground"
                          : p.priority === "mid"
                            ? "bg-warning text-primary"
                            : "bg-muted-foreground/40 text-primary-foreground"
                      }`}
                    >
                      <K.icon className="h-2.5 w-2.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="tnum text-[10px] font-bold text-muted-foreground">
                        {p.id} · {p.where}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${pr.chip}`}
                        >
                          {pr.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${problemStatusChip[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-0.5 text-sm font-semibold leading-snug">{p.title}</div>
                    <div className="tnum mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <K.icon className="h-3 w-3" /> {K.label} · {p.who}
                      </span>
                      <span>{p.age}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Фото-прогресс
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">6 недель</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photoProgress.map((p, i) => {
              const isLast = i === photoProgress.length - 1;
              return (
                <div
                  key={p.date + p.label}
                  className="group relative overflow-hidden rounded-xl border border-border bg-linear-to-br from-brand-soft/60 to-muted/40 transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center">
                    <Camera className="h-6 w-6 text-accent-foreground/60" />
                    {isLast && (
                      <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary-foreground">
                        новое
                      </span>
                    )}
                    <span className="absolute left-1 top-1 rounded-full bg-background/80 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                      {p.tag}
                    </span>
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="tnum text-[10px] font-bold text-muted-foreground">{p.date}</div>
                    <div className="truncate text-[11px] font-extrabold">{p.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)" }}
        />
        <div className="relative mb-4 flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Достижения команды объекта
            </h3>
          </div>
          <Link
            to="/league"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-foreground hover:underline"
          >
            Лига участков <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {achievements.map((a) => (
            <div
              key={a.title}
              className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                a.unlocked
                  ? "border-accent/40 bg-brand-soft/60"
                  : "border-dashed border-border bg-muted/40 opacity-80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    a.unlocked
                      ? "bg-linear-to-br from-primary to-accent text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold">{a.title}</div>
                  <div className="tnum text-[10px] text-muted-foreground">
                    {a.unlocked ? "получено" : (a.progress ?? "в процессе")}
                  </div>
                </div>
                {a.unlocked && <Sparkles className="ml-auto h-4 w-4 text-warning" />}
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background/70 p-4 ring-1 ring-border">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
                Следующий уровень объекта
              </div>
              <div className="tnum text-sm font-extrabold">
                Закрой 3 работы крит. пути в Блоке 3 и снизь замечания ПТО до ≤5 — объект уйдёт в
                «зелёное».
              </div>
            </div>
          </div>
          <Link
            to="/gpr"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Открыть ГПР <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
