import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GanttChartSquare,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Zap,
  Timer,
  Route as RouteIcon,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/gpr")({
  head: () => ({
    meta: [
      { title: "Полный ГПР — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "График производства работ: гантт по блокам ЖК, план/факт, критический путь и симуляция сдвигов.",
      },
      { property: "og:title", content: "Полный ГПР — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "График производства работ: гантт по блокам ЖК, план/факт, критический путь и симуляция сдвигов.",
      },
    ],
  }),
  component: GprPage,
});

type Status = "green" | "yellow" | "red" | "done";

interface Task {
  id: string;
  name: string;
  complex: "AUR" | "ATM" | "KRN" | "AKS";
  block: string;
  planStart: number;
  planEnd: number;
  factStart: number;
  factEnd: number; // may exceed planEnd -> late
  progress: number;
  status: Status;
  critical: boolean;
  team: string;
}

const complexMeta: Record<Task["complex"], { name: string; short: string }> = {
  AUR: { name: "ЖК Аура", short: "Аура" },
  ATM: { name: "ЖК Атмосфера", short: "Атмосфера" },
  KRN: { name: "ЖК Керуен", short: "Керуен" },
  AKS: { name: "ЖК Аксай", short: "Аксай" },
};

const tasks: Task[] = [
  // AUR — Аура
  {
    id: "AUR-B1-01",
    name: "Монолит, ярус 6–7",
    complex: "AUR",
    block: "Блок 3",
    planStart: 0,
    planEnd: 4,
    factStart: 0,
    factEnd: 6,
    progress: 78,
    status: "red",
    critical: true,
    team: "Ержан К.",
  },
  {
    id: "AUR-B1-02",
    name: "Монтаж лифт. шахты",
    complex: "AUR",
    block: "Блок 3",
    planStart: 3,
    planEnd: 6,
    factStart: 4,
    factEnd: 7,
    progress: 55,
    status: "red",
    critical: true,
    team: "Ержан К.",
  },
  {
    id: "AUR-B1-03",
    name: "Кладка стен 4–5 эт.",
    complex: "AUR",
    block: "Блок 2",
    planStart: 2,
    planEnd: 6,
    factStart: 2,
    factEnd: 6,
    progress: 82,
    status: "green",
    critical: false,
    team: "Тимур Б.",
  },
  {
    id: "AUR-B1-04",
    name: "Штукатурка, п.2",
    complex: "AUR",
    block: "Блок 1",
    planStart: 4,
    planEnd: 8,
    factStart: 5,
    factEnd: 8,
    progress: 60,
    status: "yellow",
    critical: false,
    team: "Динара М.",
  },
  {
    id: "AUR-B1-05",
    name: "Стяжка полов",
    complex: "AUR",
    block: "Блок 1",
    planStart: 5,
    planEnd: 8,
    factStart: 5,
    factEnd: 8,
    progress: 45,
    status: "green",
    critical: false,
    team: "Динара М.",
  },
  {
    id: "AUR-B1-06",
    name: "Внутренние сети ВК",
    complex: "AUR",
    block: "Блок 2",
    planStart: 6,
    planEnd: 10,
    factStart: 7,
    factEnd: 10,
    progress: 20,
    status: "yellow",
    critical: true,
    team: "Кайрат Б.",
  },
  // ATM — Атмосфера
  {
    id: "ATM-01",
    name: "Каркас, секция А",
    complex: "ATM",
    block: "Блок 1",
    planStart: 1,
    planEnd: 5,
    factStart: 1,
    factEnd: 5,
    progress: 95,
    status: "green",
    critical: false,
    team: "Ержан К.",
  },
  {
    id: "ATM-02",
    name: "Витражи, секция А",
    complex: "ATM",
    block: "Блок 1",
    planStart: 5,
    planEnd: 9,
    factStart: 5,
    factEnd: 9,
    progress: 40,
    status: "green",
    critical: false,
    team: "Данияр А.",
  },
  {
    id: "ATM-03",
    name: "Отделка МОП",
    complex: "ATM",
    block: "Блок 1",
    planStart: 8,
    planEnd: 12,
    factStart: 8,
    factEnd: 12,
    progress: 12,
    status: "green",
    critical: false,
    team: "Динара М.",
  },
  {
    id: "ATM-04",
    name: "Кровля, секция Б",
    complex: "ATM",
    block: "Блок 2",
    planStart: 3,
    planEnd: 7,
    factStart: 4,
    factEnd: 8,
    progress: 66,
    status: "yellow",
    critical: false,
    team: "Тимур Б.",
  },
  // KRN — Керуен
  {
    id: "KRN-01",
    name: "Фундамент, ось 1–3",
    complex: "KRN",
    block: "Блок 1",
    planStart: 0,
    planEnd: 3,
    factStart: 0,
    factEnd: 3,
    progress: 100,
    status: "done",
    critical: false,
    team: "Кайрат Б.",
  },
  {
    id: "KRN-02",
    name: "Монолит, 1–3 эт.",
    complex: "KRN",
    block: "Блок 1",
    planStart: 3,
    planEnd: 8,
    factStart: 3,
    factEnd: 8,
    progress: 62,
    status: "green",
    critical: true,
    team: "Ержан К.",
  },
  {
    id: "KRN-03",
    name: "Инженерные сети",
    complex: "KRN",
    block: "Блок 2",
    planStart: 4,
    planEnd: 9,
    factStart: 5,
    factEnd: 10,
    progress: 30,
    status: "yellow",
    critical: true,
    team: "Алия Ж.",
  },
  {
    id: "KRN-04",
    name: "Устройство паркинга",
    complex: "KRN",
    block: "Блок 3",
    planStart: 2,
    planEnd: 7,
    factStart: 3,
    factEnd: 9,
    progress: 40,
    status: "red",
    critical: false,
    team: "Тимур Б.",
  },
  // AKS — Аксай
  {
    id: "AKS-01",
    name: "Земляные работы",
    complex: "AKS",
    block: "Блок 1",
    planStart: 0,
    planEnd: 2,
    factStart: 0,
    factEnd: 2,
    progress: 100,
    status: "done",
    critical: false,
    team: "Кайрат Б.",
  },
  {
    id: "AKS-02",
    name: "Свайное поле",
    complex: "AKS",
    block: "Блок 1",
    planStart: 2,
    planEnd: 5,
    factStart: 2,
    factEnd: 5,
    progress: 85,
    status: "green",
    critical: true,
    team: "Ержан К.",
  },
  {
    id: "AKS-03",
    name: "Ростверк",
    complex: "AKS",
    block: "Блок 1",
    planStart: 5,
    planEnd: 8,
    factStart: 5,
    factEnd: 8,
    progress: 20,
    status: "green",
    critical: true,
    team: "Данияр А.",
  },
  {
    id: "AKS-04",
    name: "ТУ на сети",
    complex: "AKS",
    block: "Блок 2",
    planStart: 3,
    planEnd: 6,
    factStart: 4,
    factEnd: 8,
    progress: 55,
    status: "red",
    critical: false,
    team: "Алия Ж.",
  },
];

const WEEKS = 12;
const weekLabels = Array.from({ length: WEEKS }, (_, i) => `н${i + 1}`);

const statusMeta: Record<
  Status,
  { chip: string; dot: string; label: string; bar: string; icon: LucideIcon }
> = {
  green: {
    chip: "bg-success/10 text-success ring-1 ring-success/20",
    dot: "bg-success",
    label: "В срок",
    bar: "bg-success",
    icon: CheckCircle2,
  },
  yellow: {
    chip: "bg-warning/15 text-accent-foreground ring-1 ring-warning/30",
    dot: "bg-warning",
    label: "Риск",
    bar: "bg-warning",
    icon: AlertTriangle,
  },
  red: {
    chip: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
    dot: "bg-destructive",
    label: "Просрочка",
    bar: "bg-destructive",
    icon: Flame,
  },
  done: {
    chip: "bg-muted text-muted-foreground ring-1 ring-border",
    dot: "bg-muted-foreground/60",
    label: "Готово",
    bar: "bg-muted-foreground/60",
    icon: CheckCircle2,
  },
};

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

function GprPage() {
  const [complex, setComplex] = useState<Task["complex"] | "ALL">("AUR");
  const [block, setBlock] = useState<string>("ALL");
  const [shift, setShift] = useState(0); // weeks shift on selected task
  const [selected, setSelected] = useState<string>("AUR-B1-01");

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (complex === "ALL" || t.complex === complex) && (block === "ALL" || t.block === block),
      ),
    [complex, block],
  );

  const blocksAvail = useMemo(() => {
    const s = new Set<string>();
    tasks.filter((t) => complex === "ALL" || t.complex === complex).forEach((t) => s.add(t.block));
    return ["ALL", ...Array.from(s)];
  }, [complex]);

  // KPIs on filtered
  const total = filtered.length;
  const late = filtered.filter((t) => t.status === "red").length;
  const risk = filtered.filter((t) => t.status === "yellow").length;
  const onTime = filtered.filter((t) => t.status === "green" || t.status === "done").length;
  const health = total ? Math.round(((onTime + risk * 0.5) / total) * 100) : 0;

  // Critical path
  const critTasks = filtered.filter((t) => t.critical);
  const critLatePlan = critTasks.reduce((s, t) => s + Math.max(0, t.factEnd - t.planEnd), 0);
  const critWithShift = critLatePlan + (tasks.find((t) => t.id === selected)?.critical ? shift : 0);

  const complexes: { key: Task["complex"] | "ALL"; label: string }[] = [
    { key: "ALL", label: "Все" },
    { key: "AUR", label: "Аура" },
    { key: "ATM", label: "Атмосфера" },
    { key: "KRN", label: "Керуен" },
    { key: "AKS", label: "Аксай" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-foreground/70">Операционное ядро · ГПР</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Полный ГПР</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            План/факт по работам, критический путь и симуляция сдвигов — по 4 ЖК одним экраном.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success ring-1 ring-success/20">
            <Activity className="h-3.5 w-3.5" />
            Здоровье графика {health}%
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive ring-1 ring-destructive/20">
            <Flame className="h-3.5 w-3.5" />
            {late} не в срок
          </span>
          <span className="tnum inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-bold text-accent-foreground ring-1 ring-warning/30">
            <RouteIcon className="h-3.5 w-3.5" />
            Крит. путь: −{critWithShift} дн.
          </span>
        </div>
      </div>

      {/* Cockpit ribbon */}
      <section className="card-soft grid gap-3 p-4 md:grid-cols-4">
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Здоровье графика
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="tnum text-2xl font-extrabold">{health}%</div>
            <DeltaChip v={3} />
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-700"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Работ в срок
          </div>
          <div className="tnum mt-1 text-2xl font-extrabold">
            {onTime}
            <span className="ml-1 text-sm font-semibold text-muted-foreground">/ {total}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            включая {filtered.filter((t) => t.status === "done").length} закрытых
          </div>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Отставаний
          </div>
          <div className="tnum mt-1 text-2xl font-extrabold text-destructive">{late}</div>
          <div className="tnum mt-1 text-[11px] text-muted-foreground">риск: {risk}</div>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Критический путь
          </div>
          <div className="tnum mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">−{critWithShift}</span>
            <span className="text-sm text-muted-foreground">дн.</span>
          </div>
          <div className="tnum mt-1 text-[11px] text-muted-foreground">
            {critTasks.length} работ · шаг симуляции {shift > 0 ? `+${shift}` : shift} нед.
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-2">
        <div className="mr-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          ЖК:
        </div>
        {complexes.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setComplex(c.key);
              setBlock("ALL");
            }}
            className={`tnum inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              complex === c.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-ring"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="mx-2 h-4 w-px bg-border" />
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Блоки:
        </div>
        {blocksAvail.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBlock(b)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
              block === b
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-muted-foreground hover:border-ring hover:text-foreground"
            }`}
          >
            {b === "ALL" ? "Все" : b}
          </button>
        ))}
      </section>

      {/* Gantt */}
      <section className="card-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Гантт · план / факт
            </h2>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm border border-dashed border-muted-foreground/60" />{" "}
              план
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-linear-to-r from-primary to-accent" /> факт
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-destructive" /> просрочка
            </span>
            <span className="inline-flex items-center gap-1">
              <RouteIcon className="h-3 w-3 text-warning" /> крит. путь
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header row */}
            <div className="tnum grid grid-cols-[260px_1fr] items-center border-b border-border bg-muted/30">
              <div className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Работа
              </div>
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
              >
                {weekLabels.map((w, i) => (
                  <div
                    key={w}
                    className={`border-l border-border/60 py-2 text-center text-[10px] font-bold uppercase tracking-wide ${
                      i === 3 ? "text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {w}
                  </div>
                ))}
              </div>
            </div>

            {filtered.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Нет работ по выбранным фильтрам · попробуйте расширить выборку.
              </div>
            )}

            {filtered.map((t) => {
              const isSelected = selected === t.id;
              const effShift = isSelected ? shift : 0;
              const factStart = Math.max(0, t.factStart + effShift);
              const factEnd = Math.max(factStart + 1, t.factEnd + effShift);
              const meta = statusMeta[t.status];
              const late = factEnd - t.planEnd;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`group grid w-full grid-cols-[260px_1fr] items-center border-b border-border/60 text-left transition-colors ${
                    isSelected ? "bg-brand-soft/50" : "hover:bg-muted/40"
                  }`}
                >
                  {/* label */}
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-extrabold">{t.name}</span>
                        {t.critical && <RouteIcon className="h-3 w-3 shrink-0 text-warning" />}
                      </div>
                      <div className="tnum truncate text-[10px] text-muted-foreground">
                        {complexMeta[t.complex].short} · {t.block} · {t.team}
                      </div>
                    </div>
                  </div>

                  {/* bars */}
                  <div
                    className="relative grid h-12 items-center"
                    style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
                  >
                    {/* Grid lines */}
                    {weekLabels.map((_, i) => (
                      <div key={i} className="h-full border-l border-border/50" />
                    ))}
                    {/* plan bar */}
                    <div
                      className="absolute inset-y-3 rounded-md border border-dashed border-muted-foreground/60 bg-muted/30"
                      style={{
                        left: `${(t.planStart / WEEKS) * 100}%`,
                        width: `${((t.planEnd - t.planStart) / WEEKS) * 100}%`,
                      }}
                    />
                    {/* fact bar */}
                    <div
                      className={`absolute inset-y-4 flex items-center overflow-hidden rounded-md transition-all duration-500 ${
                        t.critical ? "ring-2 ring-warning/60" : ""
                      }`}
                      style={{
                        left: `${(factStart / WEEKS) * 100}%`,
                        width: `${((factEnd - factStart) / WEEKS) * 100}%`,
                        background:
                          t.status === "red"
                            ? "linear-gradient(90deg, var(--color-destructive), color-mix(in oklab, var(--color-destructive) 70%, var(--color-warning)))"
                            : t.status === "yellow"
                              ? "linear-gradient(90deg, var(--color-warning), var(--color-accent))"
                              : t.status === "done"
                                ? "color-mix(in oklab, var(--color-muted-foreground) 40%, transparent)"
                                : "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                      }}
                    >
                      <div
                        className="h-full bg-background/25"
                        style={{ width: `${100 - t.progress}%`, marginLeft: `${t.progress}%` }}
                      />
                      <span className="tnum absolute inset-0 grid place-items-center text-[10px] font-extrabold text-primary-foreground mix-blend-luminosity">
                        {t.progress}%
                      </span>
                    </div>
                    {/* late tail */}
                    {late > 0 && (
                      <span
                        className="tnum absolute top-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold text-destructive"
                        style={{ left: `calc(${(factEnd / WEEKS) * 100}% + 4px)` }}
                      >
                        +{late} нед.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* footer summary */}
        <div className="grid grid-cols-2 gap-3 border-t border-border bg-muted/30 px-4 py-3 text-[11px] font-semibold text-muted-foreground md:grid-cols-4">
          <div className="tnum inline-flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" /> 4 ЖК
          </div>
          <div className="tnum inline-flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5" />{" "}
            {new Set(filtered.map((t) => `${t.complex}-${t.block}`)).size} блоков
          </div>
          <div className="tnum inline-flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> {total} работ
          </div>
          <div className="tnum inline-flex items-center gap-2 text-destructive">
            <Flame className="h-3.5 w-3.5" /> {late} не в срок
          </div>
        </div>
      </section>

      {/* Simulation + critical path */}
      <section className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <div className="card-soft relative overflow-hidden p-5">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-3xl"
            style={{
              background: "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
              <Sparkles className="h-3.5 w-3.5" />
              Симуляция сдвига
            </div>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Работа
                </div>
                <div className="mt-0.5 truncate text-lg font-extrabold">
                  {tasks.find((t) => t.id === selected)?.name ?? "—"}
                </div>
                <div className="tnum text-[11px] text-muted-foreground">
                  {(() => {
                    const t = tasks.find((x) => x.id === selected);
                    if (!t) return "выберите строку в гантте";
                    return `${complexMeta[t.complex].short} · ${t.block} · ${t.team} · ${t.critical ? "критический путь" : "вне крит. пути"}`;
                  })()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShift(0)}
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Сброс
              </button>
            </div>

            <div className="mt-4">
              <div className="tnum mb-2 flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Сдвиг работы, недели</span>
                <span
                  className={`${shift > 0 ? "text-destructive" : shift < 0 ? "text-success" : "text-foreground"}`}
                >
                  {shift > 0 ? "+" : ""}
                  {shift} нед.
                </span>
              </div>
              <input
                type="range"
                min={-2}
                max={3}
                step={1}
                value={shift}
                onChange={(e) => setShift(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="tnum mt-1 flex justify-between text-[9px] font-bold text-muted-foreground">
                <span>−2</span>
                <span>−1</span>
                <span>0</span>
                <span>+1</span>
                <span>+2</span>
                <span>+3</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Крит. путь сейчас
                </div>
                <div className="tnum mt-1 text-lg font-extrabold text-destructive">
                  −{critLatePlan} дн.
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  После сдвига
                </div>
                <div
                  className={`tnum mt-1 text-lg font-extrabold ${
                    critWithShift > critLatePlan
                      ? "text-destructive"
                      : critWithShift < critLatePlan
                        ? "text-success"
                        : "text-foreground"
                  }`}
                >
                  −{critWithShift} дн.
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Влияние
                </div>
                <div className="tnum mt-1 text-lg font-extrabold">
                  {(() => {
                    const t = tasks.find((x) => x.id === selected);
                    if (!t || !t.critical) return "нет";
                    const d = shift * 7;
                    return `${d > 0 ? "+" : ""}${d} дн.`;
                  })()}
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted-foreground">
              Совет: сдвиг работ вне крит. пути не двигает срок сдачи, но давит на ресурсы соседних
              бригад.
            </p>
          </div>
        </div>

        <div className="card-soft p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Критический путь
              </h3>
            </div>
            <span className="tnum text-[10px] font-bold text-muted-foreground">
              {critTasks.length} работ · −{critWithShift} дн.
            </span>
          </div>

          {critTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              На выборке нет работ критического пути — фильтр слишком узкий.
            </div>
          ) : (
            <ol className="flex flex-col">
              {critTasks.map((t, i) => {
                const meta = statusMeta[t.status];
                const isLast = i === critTasks.length - 1;
                const late = t.factEnd - t.planEnd;
                return (
                  <li key={t.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {!isLast && (
                      <span className="absolute left-[13px] top-6 h-full w-px bg-border" />
                    )}
                    <div
                      className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ${meta.dot} text-primary-foreground`}
                    >
                      <meta.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-extrabold">{t.name}</div>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${meta.chip}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="tnum mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>
                          {complexMeta[t.complex].short} · {t.block}
                        </span>
                        <span>·</span>
                        <span>{t.team}</span>
                        {late > 0 && (
                          <span className="tnum ml-auto text-destructive font-bold">
                            +{late} нед.
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* Speed / gamification strip */}
      <section className="card-soft flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-foreground/80">
              Темп графика · неделя
            </div>
            <div className="tnum text-lg font-extrabold">
              78% работ идут в план · +6% к прошлой неделе
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ержан К. закрыл 2 задачи с крит. пути — команда получила +450 XP.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-muted/40 px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              На этой неделе
            </div>
            <div className="tnum text-sm font-extrabold">
              <span className="text-success">+3 в срок</span> ·{" "}
              <span className="text-destructive">−2 просрочки</span>
            </div>
          </div>
          <div className="rounded-xl bg-muted/40 px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              До «зелёного» графика
            </div>
            <div className="tnum flex items-center gap-1.5 text-sm font-extrabold">
              <Timer className="h-3.5 w-3.5" /> закрыть 4 работы крит. пути
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
