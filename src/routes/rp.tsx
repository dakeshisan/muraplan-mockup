import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gauge,
  Timer,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Trophy,
  Zap,
  Users,
  HardHat,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Camera,
  ShieldCheck,
  Shield,
  Layers,
  Sparkles,
  Star,
  Crown,
  MessageSquare,
  ClipboardCheck,
  Wrench,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/rp")({
  head: () => ({
    meta: [
      { title: "Пульт РП — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Рабочий стол руководителя проекта: ГПР, задачи участка, замечания качества и лидерборд РП.",
      },
      { property: "og:title", content: "Пульт РП — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Рабочий стол руководителя проекта: ГПР, задачи участка, замечания качества и лидерборд РП.",
      },
    ],
  }),
  component: RpDesk,
});

type Tone = "primary" | "success" | "warning" | "danger" | "gold";

function ProgressBar({ pct, tone = "primary" }: { pct: number; tone?: Tone }) {
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

interface Goal {
  label: string;
  fact: string;
  plan: string;
  pct: number;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
}

const goals: Goal[] = [
  {
    label: "Работ в план",
    fact: "82%",
    plan: "цель 90%",
    pct: 82,
    hint: "Монолит подтягивается, отделка Блока 1 в срок",
    icon: Gauge,
    tone: "primary",
  },
  {
    label: "Отставаний закрыто",
    fact: "12 / 15",
    plan: "за неделю",
    pct: 80,
    hint: "Осталось 3 · срок до пятницы",
    icon: ShieldCheck,
    tone: "gold",
  },
  {
    label: "Замечаний устранено",
    fact: "34 / 40",
    plan: "по ПТО и ОТ",
    pct: 85,
    hint: "6 в работе · 2 требуют переделки",
    icon: ClipboardCheck,
    tone: "success",
  },
  {
    label: "Дней без нового отставания",
    fact: "6",
    plan: "streak · рекорд 11",
    pct: 55,
    hint: "+1 день = +250 XP · до рекорда 5 дней",
    icon: Flame,
    tone: "warning",
  },
];

interface Control {
  title: string;
  where: string;
  detail: string;
  action: string;
  tone: "danger" | "warning" | "info";
  icon: LucideIcon;
  meta: string;
}

const controls: Control[] = [
  {
    title: "Критическое отставание ГПР",
    where: "Блок 3 · Монолит 7 эт.",
    detail: "−12 дней к плану · арматура пришла с задержкой на 4 дня",
    action: "Ускорить",
    tone: "danger",
    icon: AlertTriangle,
    meta: "Ержан К. · 2 бригады",
  },
  {
    title: "Просрочена задача участка",
    where: "Блок 2 · Кладка 4 эт.",
    detail: "Срок был 09.11 · сдвинулась смена бригадира",
    action: "Разобрать",
    tone: "warning",
    icon: Timer,
    meta: "Тимур Б.",
  },
  {
    title: "Замечание качества · ПТО",
    where: "Блок 1 · подъезд 2, 5 эт.",
    detail: "Стяжка не по классу · требуется переделка ~120 м²",
    action: "Назначить",
    tone: "info",
    icon: MessageSquare,
    meta: "Динара М.",
  },
];

interface Kpi {
  label: string;
  value: string;
  sub: string;
  delta: number;
  icon: LucideIcon;
}

const kpis: Kpi[] = [
  { label: "Работ в срок", value: "82%", sub: "цель 90%", delta: 4, icon: Gauge },
  { label: "Отставаний", value: "8", sub: "было 15", delta: -47, icon: Flame },
  { label: "Задач открыто", value: "34", sub: "12 срочных", delta: -6, icon: ClipboardList },
  { label: "Замечаний качества", value: "6", sub: "40 закрыто", delta: -20, icon: MessageSquare },
  { label: "Бригад на объекте", value: "11", sub: "168 чел.", delta: 8, icon: Users },
  { label: "Простой, ч/сут", value: "3,4", sub: "было 6,8", delta: -50, icon: Timer },
];

type Stage = "Сегодня" | "В работе" | "На проверке" | "Готово";
type Priority = "high" | "mid" | "low";

interface Task {
  title: string;
  block: string;
  who: string;
  due: string;
  progress: number;
  priority: Priority;
  stage: Stage;
}

const tasks: Task[] = [
  {
    title: "Заливка колонн, ось 4–7",
    block: "Блок 3 · 7 эт.",
    who: "Ержан К.",
    due: "до 18:00",
    progress: 20,
    priority: "high",
    stage: "Сегодня",
  },
  {
    title: "Приёмка кладки",
    block: "Блок 2 · 4 эт.",
    who: "Тимур Б.",
    due: "сегодня",
    progress: 0,
    priority: "high",
    stage: "Сегодня",
  },
  {
    title: "Разметка перегородок",
    block: "Блок 1 · 5 эт.",
    who: "Кайрат Б.",
    due: "сегодня",
    progress: 40,
    priority: "mid",
    stage: "Сегодня",
  },
  {
    title: "Монтаж лифт. шахты",
    block: "Блок 3 · 6 эт.",
    who: "Ержан К.",
    due: "к 12.11",
    progress: 65,
    priority: "high",
    stage: "В работе",
  },
  {
    title: "Стяжка полов",
    block: "Блок 1 · 3 эт.",
    who: "Динара М.",
    due: "к 13.11",
    progress: 55,
    priority: "mid",
    stage: "В работе",
  },
  {
    title: "Электрика · штробы",
    block: "Блок 2 · 2 эт.",
    who: "Алия Ж.",
    due: "к 14.11",
    progress: 30,
    priority: "low",
    stage: "В работе",
  },
  {
    title: "Опрессовка отопления",
    block: "Блок 1 · 1 эт.",
    who: "Тимур Б.",
    due: "проверка ПТО",
    progress: 100,
    priority: "mid",
    stage: "На проверке",
  },
  {
    title: "Устройство ЦПС · крыльцо",
    block: "Блок 2 · вход А",
    who: "Кайрат Б.",
    due: "проверка ПТО",
    progress: 100,
    priority: "low",
    stage: "На проверке",
  },
  {
    title: "Демонтаж опалубки",
    block: "Блок 3 · 5 эт.",
    who: "Ержан К.",
    due: "вчера",
    progress: 100,
    priority: "high",
    stage: "Готово",
  },
  {
    title: "Приёмка окон",
    block: "Блок 1 · 4 эт.",
    who: "Данияр А.",
    due: "вчера",
    progress: 100,
    priority: "mid",
    stage: "Готово",
  },
];

const stages: { key: Stage; icon: LucideIcon; tone: string }[] = [
  { key: "Сегодня", icon: Zap, tone: "bg-destructive/10 text-destructive ring-destructive/20" },
  { key: "В работе", icon: Wrench, tone: "bg-warning/15 text-accent-foreground ring-warning/30" },
  { key: "На проверке", icon: ClipboardCheck, tone: "bg-info/10 text-info ring-info/20" },
  { key: "Готово", icon: CheckCircle2, tone: "bg-success/10 text-success ring-success/20" },
];

const priorityMeta: Record<Priority, { label: string; chip: string }> = {
  high: { label: "Срочно", chip: "bg-destructive/10 text-destructive ring-1 ring-destructive/20" },
  mid: { label: "План", chip: "bg-brand-soft text-accent-foreground ring-1 ring-accent/30" },
  low: { label: "Фон", chip: "bg-muted text-muted-foreground ring-1 ring-border" },
};

interface BlockBar {
  code: string;
  name: string;
  plan: number;
  fact: number;
  delta: number; // days
  works: string;
}

const blocks: BlockBar[] = [
  {
    code: "Б1",
    name: "Блок 1 · отделка",
    plan: 88,
    fact: 90,
    delta: 2,
    works: "Стяжка · штукатурка",
  },
  {
    code: "Б2",
    name: "Блок 2 · кладка+ин.сети",
    plan: 70,
    fact: 66,
    delta: -4,
    works: "Кладка 4 эт. · ВК",
  },
  { code: "Б3", name: "Блок 3 · монолит", plan: 62, fact: 50, delta: -12, works: "Колонны 7 эт." },
  {
    code: "Б4",
    name: "Блок 4 · подземный паркинг",
    plan: 45,
    fact: 47,
    delta: 1,
    works: "Гидроизоляция",
  },
  {
    code: "Б5",
    name: "Блок 5 · благоустройство",
    plan: 22,
    fact: 24,
    delta: 1,
    works: "Основание проездов",
  },
];

type IssueStatus = "Открыто" | "В работе" | "На переделке" | "Закрыто";

interface Issue {
  id: string;
  where: string;
  what: string;
  who: string;
  age: string;
  status: IssueStatus;
  severity: "high" | "mid" | "low";
}

const issues: Issue[] = [
  {
    id: "QC-217",
    where: "Блок 1 · п.2, 5 эт.",
    what: "Стяжка вне класса прочности, требуется переделка ~120 м²",
    who: "Динара М.",
    age: "2 дня",
    status: "На переделке",
    severity: "high",
  },
  {
    id: "QC-214",
    where: "Блок 2 · п.1, 3 эт.",
    what: "Отклонение кладки по вертикали ось Б",
    who: "Тимур Б.",
    age: "1 день",
    status: "В работе",
    severity: "mid",
  },
  {
    id: "QC-209",
    where: "Блок 3 · п.А, 6 эт.",
    what: "Защитный слой арматуры менее нормы",
    who: "Ержан К.",
    age: "3 ч",
    status: "Открыто",
    severity: "high",
  },
  {
    id: "QC-198",
    where: "Блок 1 · п.2, 4 эт.",
    what: "Замечание к монтажу окон · зазоры",
    who: "Данияр А.",
    age: "вчера",
    status: "Закрыто",
    severity: "low",
  },
];

const issueStatusChip: Record<IssueStatus, string> = {
  Открыто: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  "В работе": "bg-warning/15 text-accent-foreground ring-1 ring-warning/30",
  "На переделке": "bg-info/10 text-info ring-1 ring-info/20",
  Закрыто: "bg-success/10 text-success ring-1 ring-success/20",
};

interface Achievement {
  title: string;
  desc: string;
  icon: LucideIcon;
  unlocked: boolean;
  progress?: string;
}

const achievements: Achievement[] = [
  { title: "Держит темп", desc: "Неделя без просроченных задач", icon: Zap, unlocked: true },
  { title: "Щит качества", desc: "40 замечаний закрыто в срок", icon: Shield, unlocked: true },
  {
    title: "Марафонец",
    desc: "10 дней streak без нового отставания",
    icon: Flame,
    unlocked: false,
    progress: "6/10",
  },
  {
    title: "Синхронист",
    desc: "Все 5 блоков в план 30 дней",
    icon: Layers,
    unlocked: false,
    progress: "3/5",
  },
];

interface LbRow {
  name: string;
  project: string;
  xp: number;
  onTime: number;
  streak: number;
  rank: string;
}

const leaderboard: LbRow[] = [
  { name: "Ержан К.", project: "ЖК Жұлдыз", xp: 4820, onTime: 91, streak: 14, rank: "Мастер" },
  { name: "Данияр А.", project: "ЖК Аура", xp: 4310, onTime: 82, streak: 6, rank: "Ветеран" },
  { name: "Тимур Б.", project: "ЖК Көктем", xp: 3980, onTime: 78, streak: 5, rank: "Ветеран" },
  { name: "Динара М.", project: "ЖК Нұрсая", xp: 3720, onTime: 88, streak: 9, rank: "Ветеран" },
  { name: "Кайрат Б.", project: "ЖК Арман", xp: 2610, onTime: 74, streak: 3, rank: "Опытный" },
];

function RpDesk() {
  const you = leaderboard.find((l) => l.name === "Данияр А.")!;
  const rankLevel = 7;
  const xpNext = 5000;
  const xpPct = Math.round((you.xp / xpNext) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-foreground/70">
            Пульт руководителя · сегодня
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Пульт РП</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            ЖК Аура · Данияр А. · 4 объекта под управлением · 168 человек на площадке.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success ring-1 ring-success/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            82% работ в план
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-warning/30">
            <AlertTriangle className="h-3.5 w-3.5" />8 отставаний
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-accent/30">
            <Flame className="h-3.5 w-3.5" />
            streak 6 дней
          </span>
        </div>
      </div>

      {/* Cockpit — rank + goals */}
      <section className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)" }}
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          {/* Rank card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-background/60 p-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
                <Sparkles className="h-3.5 w-3.5" />
                Ваш ранг РП
              </div>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground">
                  <HardHat className="h-8 w-8" />
                  <span className="tnum absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-warning text-[11px] font-extrabold text-primary ring-2 ring-background">
                    {rankLevel}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-extrabold leading-tight">
                    {you.rank} · {you.name}
                  </div>
                  <div className="tnum text-xs text-muted-foreground">
                    XP {you.xp.toLocaleString("ru-RU")} / {xpNext.toLocaleString("ru-RU")} · до
                    «Мастер» осталось 690
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar pct={xpPct} tone="gold" />
              <div className="tnum mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span>
                  уровень {rankLevel} · {xpPct}%
                </span>
                <span>+180 XP за сегодня</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="grid gap-3 sm:grid-cols-2">
            {goals.map((g) => (
              <div
                key={g.label}
                className="group rounded-2xl border border-border bg-background/60 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {g.label}
                    </div>
                    <div className="tnum mt-1 text-2xl font-extrabold tracking-tight">{g.fact}</div>
                    <div className="tnum text-[10px] text-muted-foreground">{g.plan}</div>
                  </div>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft transition-colors group-hover:bg-accent/60">
                    <g.icon className="h-4 w-4 text-accent-foreground/80" />
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar pct={g.pct} tone={g.tone} />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{g.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* На контроле сегодня */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            На контроле сегодня
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">3 приоритета</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {controls.map((c) => {
            const ring =
              c.tone === "danger"
                ? "ring-destructive/20"
                : c.tone === "warning"
                  ? "ring-warning/30"
                  : "ring-info/25";
            const bar =
              c.tone === "danger"
                ? "bg-destructive"
                : c.tone === "warning"
                  ? "bg-warning"
                  : "bg-info";
            const iconWrap =
              c.tone === "danger"
                ? "bg-destructive/10 text-destructive"
                : c.tone === "warning"
                  ? "bg-warning/20 text-accent-foreground"
                  : "bg-info/10 text-info";
            const chip =
              c.tone === "danger"
                ? "bg-destructive/10 text-destructive"
                : c.tone === "warning"
                  ? "bg-warning/20 text-accent-foreground"
                  : "bg-info/10 text-info";
            return (
              <div
                key={c.title}
                className={`card-soft group relative overflow-hidden p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg ${ring}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconWrap}`}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${chip}`}
                  >
                    {c.tone === "danger" ? "Риск" : c.tone === "warning" ? "Просрочка" : "Качество"}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {c.title}
                  </div>
                  <div className="mt-0.5 text-lg font-extrabold leading-tight">{c.where}</div>
                  <p className="tnum mt-1 text-xs text-muted-foreground">{c.detail}</p>
                  <div className="tnum mt-2 text-[10px] font-semibold text-muted-foreground">
                    {c.meta}
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-foreground"
                >
                  {c.action}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* KPI row */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            KPI · ЖК Аура
          </h2>
          <span className="text-[11px] font-semibold text-muted-foreground">
            обновлено 3 мин назад
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
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

      {/* Kanban задач */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
            Задачи участка
          </h2>
          <Link
            to="/gpr"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-foreground hover:underline"
          >
            Открыть ГПР <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((s) => {
            const rows = tasks.filter((t) => t.stage === s.key);
            return (
              <div key={s.key} className="card-soft flex flex-col p-3">
                <div className="mb-2 flex items-center justify-between px-1">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ring-1 ${s.tone}`}
                  >
                    <s.icon className="h-3 w-3" />
                    {s.key}
                  </div>
                  <span className="tnum text-[10px] font-bold text-muted-foreground">
                    {rows.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {rows.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
                      Пусто · всё в графике
                    </div>
                  )}
                  {rows.map((t) => {
                    const p = priorityMeta[t.priority];
                    return (
                      <div
                        key={t.title}
                        className="group rounded-xl border border-border bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-ring hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-extrabold leading-tight">
                              {t.title}
                            </div>
                            <div className="tnum mt-0.5 text-[10px] text-muted-foreground">
                              {t.block} · {t.who}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${p.chip}`}
                          >
                            {p.label}
                          </span>
                        </div>
                        {t.progress > 0 && t.progress < 100 && (
                          <div className="mt-2">
                            <ProgressBar pct={t.progress} tone="primary" />
                          </div>
                        )}
                        <div className="tnum mt-2 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                          <span>{t.due}</span>
                          {t.progress > 0 && <span>{t.progress}%</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* План/факт по блокам + Замечания */}
      <section className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              План / факт · блоки ЖК Аура
            </h3>
            <span className="text-[11px] font-semibold text-muted-foreground">готовность %</span>
          </div>
          <div className="flex flex-col gap-4">
            {blocks.map((b) => {
              const late = b.delta < 0;
              return (
                <div key={b.code} className="group">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-[10px] font-extrabold text-accent-foreground ring-1 ring-accent/30">
                        {b.code}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">{b.name}</div>
                        <div className="tnum text-[10px] text-muted-foreground">{b.works}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tnum text-[11px] text-muted-foreground">
                        план {b.plan}% · факт{" "}
                        <span className="font-extrabold text-foreground">{b.fact}%</span>
                      </span>
                      <span
                        className={`tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          late ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                        }`}
                      >
                        {late ? "" : "+"}
                        {b.delta} дн.
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    {/* Plan marker */}
                    <div
                      className="absolute inset-y-0 border-r-2 border-dashed border-muted-foreground/50"
                      style={{ width: `${b.plan}%` }}
                    />
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        late ? "bg-destructive" : "bg-linear-to-r from-primary to-accent"
                      }`}
                      style={{ width: `${b.fact}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-linear-to-r from-primary to-accent" /> факт
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm border border-dashed border-muted-foreground/60" />{" "}
              план
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-destructive" /> отставание
            </span>
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Замечания качества
            </h3>
            <Link
              to="/pto"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-foreground hover:underline"
            >
              ПТО <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {issues.map((iss) => {
              const sev =
                iss.severity === "high"
                  ? "bg-destructive"
                  : iss.severity === "mid"
                    ? "bg-warning"
                    : "bg-muted-foreground/40";
              return (
                <div
                  key={iss.id}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-background/70 p-3 transition-colors hover:border-ring"
                >
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <Camera className="h-5 w-5" />
                    <span
                      className={`absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card ${sev}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="tnum text-[10px] font-bold text-muted-foreground">
                        {iss.id} · {iss.where}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${issueStatusChip[iss.status]}`}
                      >
                        {iss.status}
                      </span>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug">
                      {iss.what}
                    </div>
                    <div className="tnum mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{iss.who}</span>
                      <span>{iss.age}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements + Leaderboard */}
      <section className="grid gap-3 xl:grid-cols-[1fr_1.2fr]">
        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Достижения
            </h3>
            <span className="tnum text-[11px] font-semibold text-muted-foreground">
              2 из 4 · +900 XP
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.title}
                className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                  a.unlocked
                    ? "border-accent/40 bg-brand-soft/60"
                    : "border-dashed border-border bg-muted/40 opacity-80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      a.unlocked
                        ? "bg-linear-to-br from-primary to-accent text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-extrabold">{a.title}</div>
                    <div className="tnum text-[10px] text-muted-foreground">
                      {a.unlocked ? "получено" : (a.progress ?? "в процессе")}
                    </div>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Лидерборд РП
            </h3>
            <Link
              to="/league"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-foreground hover:underline"
            >
              Лига участков <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            <div className="hidden grid-cols-[28px_1.4fr_0.9fr_0.9fr_0.6fr] gap-2 pb-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground md:grid">
              <span>#</span>
              <span>РП / объект</span>
              <span>XP</span>
              <span>В срок</span>
              <span className="text-right">Streak</span>
            </div>
            {leaderboard.map((r, i) => {
              const isYou = r.name === you.name;
              return (
                <div
                  key={r.name}
                  className={`grid grid-cols-2 items-center gap-2 py-2.5 text-sm transition-colors md:grid-cols-[28px_1.4fr_0.9fr_0.9fr_0.6fr] ${
                    isYou ? "rounded-lg bg-brand-soft/70 px-2" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                    <span className="tnum grid h-6 w-6 place-items-center rounded-full bg-muted text-[11px] font-extrabold">
                      {i + 1}
                    </span>
                    {i === 0 && <Crown className="h-3.5 w-3.5 text-warning" />}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">{r.name}</span>
                      {isYou && (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-accent-foreground">
                          вы
                        </span>
                      )}
                    </div>
                    <div className="tnum text-[10px] text-muted-foreground">
                      {r.rank} · {r.project}
                    </div>
                  </div>
                  <div className="tnum text-sm font-extrabold">{r.xp.toLocaleString("ru-RU")}</div>
                  <div className="tnum text-sm font-semibold">{r.onTime}%</div>
                  <div className="tnum flex items-center gap-1 md:justify-end">
                    <Flame className="h-3.5 w-3.5 text-warning" />
                    <span className="text-sm font-extrabold">{r.streak}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Motivational trail */}
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
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
                До «Мастер» РП
              </div>
              <div className="tnum mt-0.5 text-lg font-extrabold">
                690 XP · закрой 3 отставания + держи streak 4 дня
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Плюс +500 XP за неделю без просроченных задач по Блоку 3.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/object"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Разбор объекта <ArrowRight className="h-3.5 w-3.5" />
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
