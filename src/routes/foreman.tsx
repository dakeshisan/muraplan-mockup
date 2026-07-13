import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  HardHat,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Camera,
  Package,
  AlertTriangle,
  Trophy,
  Users,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Star,
  ShieldCheck,
  Wrench,
  MessageSquare,
  Plus,
  Minus,
  Crown,
  ThumbsUp,
  Truck,
  Sun,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/foreman")({
  head: () => ({
    meta: [
      { title: "Напарник мастера — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Мобильный напарник мастера: задачи дня, сдача работ, заявки материалов, чек-лист смены и бригада.",
      },
      { property: "og:title", content: "Напарник мастера — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Мобильный напарник мастера: задачи дня, сдача работ, заявки материалов, чек-лист смены и бригада.",
      },
    ],
  }),
  component: ForemanPage,
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${toneClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function Chip({
  tone = "primary",
  icon: Icon,
  children,
}: {
  tone?: Tone | "muted";
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  const cls =
    tone === "success"
      ? "bg-success/10 text-success ring-success/20"
      : tone === "warning"
        ? "bg-warning/10 text-warning ring-warning/25"
        : tone === "danger"
          ? "bg-destructive/10 text-destructive ring-destructive/25"
          : tone === "gold"
            ? "bg-accent/10 text-accent ring-accent/25"
            : tone === "muted"
              ? "bg-muted text-muted-foreground ring-border/60"
              : "bg-primary/10 text-primary ring-primary/20";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

// ---------- MOCK DATA ----------

type DayTask = {
  id: string;
  title: string;
  place: string;
  xp: number;
  done: boolean;
  kind: "handover" | "supply" | "fix" | "check" | "safety";
};

const initialTasks: DayTask[] = [
  { id: "T-1", title: "Сдать стяжку — Блок 1, эт. 4", place: "Аура · Б1 · 4эт.", xp: 40, done: false, kind: "handover" },
  { id: "T-2", title: "Заявка: арматура Ø12, 1.2 т", place: "Аура · Б2", xp: 15, done: false, kind: "supply" },
  { id: "T-3", title: "Исправить замечание ПТО #142", place: "Аура · Б1 · 3эт.", xp: 25, done: false, kind: "fix" },
  { id: "T-4", title: "Инструктаж по безопасности", place: "Бригада · утро", xp: 10, done: true, kind: "safety" },
  { id: "T-5", title: "Приёмка опалубки — Блок 3", place: "Аура · Б3 · 2эт.", xp: 20, done: false, kind: "check" },
  { id: "T-6", title: "Фото-фиксация армирования", place: "Аура · Б2 · 5эт.", xp: 15, done: false, kind: "check" },
  { id: "T-7", title: "Табель бригады за смену", place: "Бригада", xp: 10, done: false, kind: "check" },
];

const taskKindMeta: Record<
  DayTask["kind"],
  { icon: LucideIcon; tone: Tone; label: string }
> = {
  handover: { icon: ClipboardCheck, tone: "success", label: "Сдача" },
  supply: { icon: Package, tone: "warning", label: "Материал" },
  fix: { icon: Wrench, tone: "danger", label: "Замечание" },
  check: { icon: CheckCircle2, tone: "primary", label: "Проверка" },
  safety: { icon: ShieldCheck, tone: "gold", label: "ТБ" },
};

const shiftChecklist = [
  { id: "C-1", title: "Приёмка фронта работ у РП", xp: 5 },
  { id: "C-2", title: "Инструктаж бригады, СИЗ", xp: 5 },
  { id: "C-3", title: "Проверка материалов на смену", xp: 5 },
  { id: "C-4", title: "Разметка, вынос осей", xp: 5 },
  { id: "C-5", title: "Контроль качества в процессе", xp: 10 },
  { id: "C-6", title: "Уборка захватки, техника безопасности", xp: 5 },
  { id: "C-7", title: "Фото-отчёт и табель", xp: 10 },
];

type Worker = {
  name: string;
  role: string;
  status: "present" | "late" | "absent";
  rating: number;
};

const brigade: Worker[] = [
  { name: "Ерлан К.", role: "Бригадир", status: "present", rating: 5 },
  { name: "Азамат С.", role: "Арматурщик", status: "present", rating: 5 },
  { name: "Данияр Т.", role: "Бетонщик", status: "present", rating: 4 },
  { name: "Руслан М.", role: "Бетонщик", status: "present", rating: 4 },
  { name: "Тимур О.", role: "Плотник", status: "late", rating: 4 },
  { name: "Аскар Б.", role: "Арматурщик", status: "present", rating: 5 },
  { name: "Нурлан Ж.", role: "Разнорабочий", status: "present", rating: 3 },
  { name: "Кайрат А.", role: "Плотник", status: "absent", rating: 4 },
  { name: "Марат Д.", role: "Арматурщик", status: "present", rating: 5 },
  { name: "Санжар И.", role: "Бетонщик", status: "present", rating: 4 },
];

const supplyQuick = [
  { name: "Арматура Ø12", unit: "т", qty: 1.2, need: true },
  { name: "Бетон B25", unit: "м³", qty: 18, need: true },
  { name: "Проволока вязальная", unit: "кг", qty: 25, need: false },
  { name: "Опалубочная фанера", unit: "лист", qty: 12, need: false },
];

const achievements = [
  { icon: Flame, title: "12 смен без брака", desc: "Streak чистого качества", unlocked: true, tone: "danger" as Tone },
  { icon: ClipboardCheck, title: "Сдача с 1 раза", desc: "5 сдач без переделки", unlocked: true, tone: "success" as Tone },
  { icon: Zap, title: "Быстрый старт", desc: "Начал смену до 07:30", unlocked: true, tone: "primary" as Tone },
  { icon: Trophy, title: "Норма 100%+", desc: "Выработка 3 смены подряд", unlocked: false, tone: "gold" as Tone },
];

const brigadeRating = [
  { name: "Бригада Ерлана", you: true, score: 92, tempo: 105, quality: 98, safety: 100 },
  { name: "Бригада Асета", you: false, score: 90, tempo: 102, quality: 96, safety: 100 },
  { name: "Бригада Талгата", you: false, score: 87, tempo: 98, quality: 95, safety: 100 },
  { name: "Бригада Бауржана", you: false, score: 84, tempo: 96, quality: 93, safety: 96 },
];

// ---------- PAGE ----------

function ForemanPage() {
  const [tasks, setTasks] = useState<DayTask[]>(initialTasks);
  const [check, setCheck] = useState<Record<string, boolean>>({
    "C-1": true,
    "C-2": true,
    "C-3": false,
    "C-4": false,
    "C-5": false,
    "C-6": false,
    "C-7": false,
  });
  const [supply, setSupply] = useState(supplyQuick);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = !t.done;
        if (next) flash(`+${t.xp} XP · ${t.title}`);
        return { ...t, done: next };
      }),
    );
  };

  const toggleCheck = (id: string, xp: number, title: string) => {
    setCheck((prev) => {
      const next = !prev[id];
      if (next) flash(`+${xp} XP · ${title}`);
      return { ...prev, [id]: next };
    });
  };

  const bump = (i: number, d: number) => {
    setSupply((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { ...s, qty: Math.max(0, Math.round((s.qty + d) * 10) / 10) }
          : s,
      ),
    );
  };

  const doneTasks = tasks.filter((t) => t.done).length;
  const taskPct = Math.round((doneTasks / tasks.length) * 100);
  const checkDone = Object.values(check).filter(Boolean).length;
  const checkPct = Math.round((checkDone / shiftChecklist.length) * 100);

  const xpEarned = useMemo(() => {
    const fromTasks = tasks.filter((t) => t.done).reduce((s, t) => s + t.xp, 0);
    const fromCheck = shiftChecklist
      .filter((c) => check[c.id])
      .reduce((s, c) => s + c.xp, 0);
    return fromTasks + fromCheck;
  }, [tasks, check]);

  const rank = { name: "Мастер · Уровень 7", xp: 1240 + xpEarned, next: 1500 };
  const rankPct = Math.round((rank.xp / rank.next) * 100);
  const output = 88; // % нормы
  const streak = 12;

  const present = brigade.filter((b) => b.status === "present").length;

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 pb-24 sm:px-6 sm:py-6">
      {/* Toast */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <div className="tnum flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-xl">
          <Sparkles className="h-4 w-4 text-warning" />
          {toast}
        </div>
      </div>

      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <HardHat className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
              Напарник мастера
            </h1>
            <p className="tnum truncate text-xs text-muted-foreground sm:text-sm">
              Смена · {new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })} · Аура · Блоки 1–3
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="gold" icon={Star}>
            <span className="tnum">Ур. 7</span>
          </Chip>
          <Chip tone="danger" icon={Flame}>
            <span className="tnum">{streak} смен</span>
          </Chip>
        </div>
      </header>

      {/* Cockpit */}
      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CockpitCard
          icon={Crown}
          tone="gold"
          label="Ранг · XP"
          value={
            <span className="tnum">
              {rank.xp}
              <span className="text-sm font-semibold text-muted-foreground">
                /{rank.next}
              </span>
            </span>
          }
          sub={rank.name}
          progress={rankPct}
          progressTone="gold"
        />
        <CockpitCard
          icon={ClipboardCheck}
          tone="primary"
          label="Задачи дня"
          value={
            <span className="tnum">
              {doneTasks}
              <span className="text-sm font-semibold text-muted-foreground">
                /{tasks.length}
              </span>
            </span>
          }
          sub={`${taskPct}% закрыто`}
          progress={taskPct}
          progressTone="primary"
        />
        <CockpitCard
          icon={Zap}
          tone="success"
          label="Выработка бригады"
          value={<span className="tnum">{output}%</span>}
          sub="норма смены"
          progress={output}
          progressTone={output >= 95 ? "success" : output >= 80 ? "warning" : "danger"}
        />
        <CockpitCard
          icon={ShieldCheck}
          tone="danger"
          label="Смены без брака"
          value={<span className="tnum">{streak}</span>}
          sub="streak качества"
          progress={Math.min(100, streak * 7)}
          progressTone="danger"
        />
      </section>

      {/* Сегодня — большие карточки */}
      <section className="mt-6">
        <SectionTitle icon={Sun} title="Сегодня" hint="3 главных действия" />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <BigActionCard
            tone="success"
            icon={ClipboardCheck}
            title="К сдаче сегодня"
            desc="Стяжка · Блок 1 · этаж 4"
            meta="Готовность 98% · ждёт ПТО"
            action="Сдать"
            onAction={() => flash("+40 XP · Приёмка отправлена ПТО")}
          />
          <BigActionCard
            tone="warning"
            icon={Package}
            title="Не хватает материала"
            desc="Арматура Ø12 · 1.2 т"
            meta="Муравей · заявка в 1 тап"
            action="Заявка"
            onAction={() => flash("+15 XP · Заявка в Муравей отправлена")}
          />
          <BigActionCard
            tone="danger"
            icon={Wrench}
            title="Замечание от ПТО"
            desc="Стяжка вне класса ровности"
            meta="#142 · Блок 1 · срок сегодня"
            action="Исправить"
            onAction={() => flash("+25 XP · Работа взята в исправление")}
          />
        </div>
      </section>

      {/* Задачи дня */}
      <section className="mt-6">
        <SectionTitle
          icon={ClipboardCheck}
          title="Задачи дня"
          hint={`${doneTasks} из ${tasks.length} закрыто · ${taskPct}%`}
        />
        <div className="mt-2">
          <ProgressBar pct={taskPct} tone={taskPct === 100 ? "success" : "primary"} />
        </div>
        <ul className="mt-3 space-y-2">
          {tasks.map((t) => {
            const meta = taskKindMeta[t.kind];
            const Icon = meta.icon;
            return (
              <li key={t.id}>
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.99] sm:p-4 ${
                    t.done
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
                      t.done
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    {t.done ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Chip tone={meta.tone} icon={Icon}>
                        {meta.label}
                      </Chip>
                      <span className="tnum text-[11px] font-bold text-accent">
                        +{t.xp} XP
                      </span>
                    </div>
                    <div
                      className={`mt-1 truncate text-sm font-semibold sm:text-base ${
                        t.done ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="tnum truncate text-xs text-muted-foreground">
                      {t.place}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Чек-лист смены */}
      <section className="mt-6">
        <SectionTitle
          icon={CheckCircle2}
          title="Чек-лист смены"
          hint={`${checkDone}/${shiftChecklist.length} · ${checkPct}%`}
        />
        <div className="mt-2">
          <ProgressBar pct={checkPct} tone={checkPct === 100 ? "success" : "primary"} />
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {shiftChecklist.map((c) => {
            const on = !!check[c.id];
            return (
              <li key={c.id}>
                <button
                  onClick={() => toggleCheck(c.id, c.xp, c.title)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${
                    on
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${
                      on
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {on ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </span>
                  <span
                    className={`flex-1 text-sm font-medium ${
                      on ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {c.title}
                  </span>
                  <span className="tnum text-[11px] font-bold text-accent">+{c.xp}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Заявка материала + Фото-приёмка */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Truck} title="Быстрая заявка" hint="Муравей · в 1 тап" inline />
            <Chip tone="warning" icon={Package}>
              {supply.filter((s) => s.need).length} нужно
            </Chip>
          </div>
          <ul className="mt-3 space-y-2">
            {supply.map((s, i) => (
              <li
                key={s.name}
                className={`flex items-center gap-2 rounded-xl border p-2.5 sm:p-3 ${
                  s.need ? "border-warning/30 bg-warning/5" : "border-border bg-background"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="tnum text-[11px] text-muted-foreground">
                    ед. {s.unit}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => bump(i, -1)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted active:scale-95"
                    aria-label="меньше"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="tnum w-14 text-center text-sm font-bold">
                    {s.qty}
                  </span>
                  <button
                    onClick={() => bump(i, 1)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted active:scale-95"
                    aria-label="больше"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => flash("+15 XP · Заявка отправлена в Муравей")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-accent px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg active:scale-[0.99]"
          >
            <Truck className="h-4 w-4" />
            Отправить заявку
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle icon={Camera} title="Фото-приёмка" hint="фиксация фронта работ" inline />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: "Б1 · эт.4 · стяжка", tone: "success" as Tone },
              { label: "Б1 · эт.3 · армирование", tone: "primary" as Tone },
              { label: "Б2 · эт.5 · опалубка", tone: "warning" as Tone },
              { label: "Б3 · эт.2 · разметка", tone: "primary" as Tone },
              { label: "Плюс", tone: "muted" as Tone | "muted" },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => flash("+5 XP · Фото добавлено")}
                className="group aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-border bg-linear-to-br from-muted/60 to-muted/20 p-2 text-left transition-all hover:border-primary/40 hover:from-primary/10 hover:to-accent/10 active:scale-[0.98]"
              >
                <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground group-hover:text-primary">
                  <Camera className="h-6 w-6" />
                  <span className="line-clamp-2 text-center text-[11px] font-medium">
                    {p.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="tnum mt-3 text-[11px] text-muted-foreground">
            за смену: 4 фото · сегодня: 12
          </p>
        </div>
      </section>

      {/* Бригада */}
      <section className="mt-6">
        <SectionTitle
          icon={Users}
          title="Бригада"
          hint={`${present}/${brigade.length} на смене`}
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {brigade.map((w) => {
            const tone: Tone =
              w.status === "present" ? "success" : w.status === "late" ? "warning" : "danger";
            const label =
              w.status === "present" ? "На смене" : w.status === "late" ? "Опоздание" : "Отсутствует";
            return (
              <div
                key={w.name}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                  {w.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{w.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {w.role}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Chip tone={tone}>{label}</Chip>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < w.rating ? "fill-warning text-warning" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Достижения + Рейтинг бригад */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle icon={Trophy} title="Достижения мастера" hint="твой прогресс" inline />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.title}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    a.unlocked
                      ? "border-border bg-background"
                      : "border-dashed border-border bg-muted/30 opacity-70"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      a.unlocked
                        ? a.tone === "success"
                          ? "bg-success/15 text-success"
                          : a.tone === "danger"
                            ? "bg-destructive/15 text-destructive"
                            : a.tone === "gold"
                              ? "bg-accent/15 text-accent"
                              : "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{a.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {a.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle
            icon={ThumbsUp}
            title="Рейтинг бригад"
            hint="по-доброму, вместе строим"
            inline
          />
          <ul className="mt-3 space-y-2">
            {brigadeRating.map((b, i) => (
              <li
                key={b.name}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  b.you
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <div
                  className={`tnum grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-black ${
                    i === 0
                      ? "bg-accent/15 text-accent"
                      : i === 1
                        ? "bg-muted text-foreground"
                        : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{b.name}</span>
                    {b.you ? <Chip tone="primary">ты</Chip> : null}
                  </div>
                  <div className="tnum mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
                    <span>темп {b.tempo}%</span>
                    <span>кач. {b.quality}%</span>
                    <span>ТБ {b.safety}%</span>
                  </div>
                </div>
                <div className="tnum text-lg font-black text-primary">{b.score}</div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Без «антирейтинга» — у отстающих подсвечиваем «зону роста».
          </p>
        </div>
      </section>

      {/* Nav footer */}
      <section className="mt-6 grid gap-2 sm:grid-cols-3">
        <FooterLink to="/rp" icon={HardHat} title="Пульт РП" desc="эскалация задач" />
        <FooterLink to="/pto" icon={MessageSquare} title="ПТО" desc="замечания и приёмка" />
        <FooterLink to="/supply" icon={Package} title="Снабжение" desc="статус заявок" />
      </section>

      {/* Sticky mobile CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:hidden">
        <button
          onClick={() => flash("Смена в порядке · держим темп")}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-accent px-5 py-3 text-sm font-bold text-primary-foreground shadow-2xl active:scale-[0.98]"
        >
          <AlertTriangle className="h-4 w-4" />
          Сигнал РП
        </button>
      </div>
    </div>
  );
}

// ---------- UI HELPERS ----------

function SectionTitle({
  icon: Icon,
  title,
  hint,
  inline = false,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  inline?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${inline ? "" : ""}`}>
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <h2 className="truncate text-base font-black tracking-tight sm:text-lg">
          {title}
        </h2>
      </div>
      {hint ? (
        <span className="tnum shrink-0 text-[11px] font-semibold text-muted-foreground sm:text-xs">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function CockpitCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  progress,
  progressTone,
}: {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  value: React.ReactNode;
  sub: string;
  progress: number;
  progressTone: Tone;
}) {
  const iconBg =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "danger"
        ? "bg-destructive/15 text-destructive"
        : tone === "warning"
          ? "bg-warning/15 text-warning"
          : tone === "gold"
            ? "bg-accent/15 text-accent"
            : "bg-primary/15 text-primary";
  return (
    <div className="group rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-4">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 text-2xl font-black leading-none sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 truncate text-[11px] text-muted-foreground">{sub}</div>
      <div className="mt-3">
        <ProgressBar pct={progress} tone={progressTone} />
      </div>
    </div>
  );
}

function BigActionCard({
  tone,
  icon: Icon,
  title,
  desc,
  meta,
  action,
  onAction,
}: {
  tone: Tone;
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
  action: string;
  onAction: () => void;
}) {
  const ring =
    tone === "success"
      ? "border-success/30 bg-success/5"
      : tone === "warning"
        ? "border-warning/30 bg-warning/5"
        : tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-primary/30 bg-primary/5";
  const btn =
    tone === "success"
      ? "bg-success text-success-foreground"
      : tone === "warning"
        ? "bg-warning text-warning-foreground"
        : tone === "danger"
          ? "bg-destructive text-destructive-foreground"
          : "bg-primary text-primary-foreground";
  const iconWrap =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "warning"
        ? "bg-warning/15 text-warning"
        : tone === "danger"
          ? "bg-destructive/15 text-destructive"
          : "bg-primary/15 text-primary";
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${ring}`}
    >
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconWrap}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-black uppercase tracking-wide">
            {title}
          </div>
          <div className="tnum truncate text-[11px] text-muted-foreground">{meta}</div>
        </div>
      </div>
      <div className="text-base font-semibold leading-snug">{desc}</div>
      <button
        onClick={onAction}
        className={`mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${btn}`}
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function FooterLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
