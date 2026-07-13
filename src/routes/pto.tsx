import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  FileCheck2,
  FileWarning,
  Scale,
  Ruler,
  Repeat,
  ShieldCheck,
  Flame,
  Crown,
  Star,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Building2,
  Handshake,
  Home,
  Coins,
  Search,
  Filter,
  ChevronRight,
  Timer,
  MessageSquare,
  HardHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/pto")({
  head: () => ({
    meta: [
      { title: "ПТО и бартер — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Рабочий стол ПТО: приёмка актов, расхождения факт/смета, обмеры и бартер работ в зачёт квартир.",
      },
      { property: "og:title", content: "ПТО и бартер — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Рабочий стол ПТО: приёмка актов, расхождения факт/смета, обмеры и бартер работ в зачёт квартир.",
      },
    ],
  }),
  component: PtoDesk,
});

type Tone = "primary" | "success" | "warning" | "danger" | "gold";

// ---------- utils ----------

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

function DeltaChip({
  v,
  suffix = "%",
  invert = false,
}: {
  v: number;
  suffix?: string;
  invert?: boolean;
}) {
  const up = v >= 0;
  const good = invert ? !up : up;
  return (
    <span
      className={`tnum inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {v}
      {suffix}
    </span>
  );
}

function fmtKzt(n: number) {
  // millions of ₸
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₸`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} тыс ₸`;
  return `${n} ₸`;
}

// ---------- data ----------

type ActRow = {
  id: string;
  name: string;
  unit: string;
  planQty: number;
  factQty: number;
  price: number; // ₸ per unit
  status: "over" | "dispute" | "match";
  note?: string;
};

type Act = {
  id: string;
  contractor: string;
  object: string;
  block: string;
  date: string;
  rows: ActRow[];
};

const acts: Act[] = [
  {
    id: "АКТ-0421",
    contractor: 'ТОО "СтройМонолит"',
    object: "Аура",
    block: "Блок 1",
    date: "11.07",
    rows: [
      { id: "1", name: "Кладка стен газоблок", unit: "м³", planQty: 120, factQty: 128, price: 42_000, status: "over", note: "Завышение объёма +8 м³" },
      { id: "2", name: "Штукатурка внутренняя", unit: "м²", planQty: 850, factQty: 812, price: 3_500, status: "match" },
      { id: "3", name: "Стяжка пола", unit: "м²", planQty: 640, factQty: 655, price: 4_800, status: "dispute", note: "Спорные +15 м² в холле" },
      { id: "4", name: "Гидроизоляция С/У", unit: "м²", planQty: 180, factQty: 180, price: 5_200, status: "match" },
    ],
  },
  {
    id: "АКТ-0422",
    contractor: 'ТОО "АрмаКонструкт"',
    object: "Атмосфера",
    block: "Блок 3",
    date: "11.07",
    rows: [
      { id: "1", name: "Арматура вязка Ø12", unit: "т", planQty: 4.2, factQty: 4.6, price: 380_000, status: "over", note: "Завышение +0.4 т" },
      { id: "2", name: "Опалубка перекрытия", unit: "м²", planQty: 620, factQty: 620, price: 2_800, status: "match" },
      { id: "3", name: "Бетон B25 подача", unit: "м³", planQty: 88, factQty: 90, price: 34_500, status: "dispute" },
    ],
  },
];

const contractorsBarter = [
  {
    name: 'ТОО "СтройМонолит"',
    works: 148_000_000,
    barter: 96_000_000,
    aptMeters: 214,
    aptCount: 4,
    project: "Аура",
  },
  {
    name: 'ТОО "АрмаКонструкт"',
    works: 92_000_000,
    barter: 68_000_000,
    aptMeters: 152,
    aptCount: 3,
    project: "Атмосфера",
  },
  {
    name: 'ТОО "ОтделкаПро"',
    works: 74_000_000,
    barter: 30_000_000,
    aptMeters: 68,
    aptCount: 2,
    project: "Керуен",
  },
  {
    name: 'ТОО "МастерФасад"',
    works: 56_000_000,
    barter: 24_000_000,
    aptMeters: 54,
    aptCount: 1,
    project: "Аксай",
  },
];

const achievements = [
  { icon: Scale, title: "Поймал 10 млн ₸", desc: "Расхождений за месяц", unlocked: true, tone: "success" as Tone },
  { icon: Timer, title: "Приёмка ≤ 2 дней", desc: "10 актов подряд", unlocked: true, tone: "primary" as Tone },
  { icon: ShieldCheck, title: "0 пропущенных завышений", desc: "30 дней streak", unlocked: true, tone: "danger" as Tone },
  { icon: Trophy, title: "Идеальный бартер", desc: "Свод сошёлся до тиына", unlocked: false, tone: "gold" as Tone },
];

const leaderboard = [
  { name: "А. Сериков", you: true, caught: 12.4, acts: 42, avgDays: 1.6 },
  { name: "Д. Нуркенов", you: false, caught: 11.1, acts: 38, avgDays: 1.8 },
  { name: "Р. Абишева", you: false, caught: 9.8, acts: 44, avgDays: 2.1 },
  { name: "Е. Тлеубаев", you: false, caught: 7.6, acts: 36, avgDays: 2.3 },
];

const rowStatusMeta: Record<
  ActRow["status"],
  { icon: LucideIcon; tone: Tone; label: string; dot: string }
> = {
  over: { icon: AlertTriangle, tone: "danger", label: "Завышение", dot: "bg-destructive" },
  dispute: { icon: CircleAlert, tone: "warning", label: "Спорно", dot: "bg-warning" },
  match: { icon: CheckCircle2, tone: "success", label: "Сходится", dot: "bg-success" },
};

// ---------- PAGE ----------

function PtoDesk() {
  const [activeAct, setActiveAct] = useState(acts[0].id);
  const [statusFilter, setStatusFilter] = useState<"all" | ActRow["status"]>("all");
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const act = acts.find((a) => a.id === activeAct) ?? acts[0];
  const rowsFiltered = act.rows.filter((r) => statusFilter === "all" || r.status === statusFilter);

  const actTotals = useMemo(() => {
    let planSum = 0;
    let factSum = 0;
    let overSum = 0;
    let disputeSum = 0;
    for (const r of act.rows) {
      planSum += r.planQty * r.price;
      factSum += r.factQty * r.price;
      const delta = (r.factQty - r.planQty) * r.price;
      if (r.status === "over") overSum += delta;
      if (r.status === "dispute") disputeSum += Math.abs(delta);
    }
    return { planSum, factSum, overSum, disputeSum };
  }, [act]);

  // company KPI
  const kpi = {
    onAcceptance: 14,
    caughtKzt: 12_400_000,
    volumesChecked: 186,
    disputed: 7,
    avgDaysAcceptance: 1.7,
  };

  const rank = { level: 6, xp: 1180, next: 1500 };
  const rankPct = Math.round((rank.xp / rank.next) * 100);
  const streak = 30;

  const barterTotals = contractorsBarter.reduce(
    (a, c) => ({
      works: a.works + c.works,
      barter: a.barter + c.barter,
      meters: a.meters + c.aptMeters,
      apts: a.apts + c.aptCount,
    }),
    { works: 0, barter: 0, meters: 0, apts: 0 },
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
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
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
              ПТО и бартер
            </h1>
            <p className="tnum truncate text-xs text-muted-foreground sm:text-sm">
              Инженер ПТО · приёмка актов, обмеры, бартер работ ⇄ квартиры
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="gold" icon={Star}>
            <span className="tnum">Ур. {rank.level}</span>
          </Chip>
          <Chip tone="danger" icon={Flame}>
            <span className="tnum">{streak} дн. streak</span>
          </Chip>
          <Chip tone="success" icon={Scale}>
            <span className="tnum">Поймано {fmtKzt(kpi.caughtKzt)}</span>
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
          sub={`Инженер ПТО · уровень ${rank.level}`}
          progress={rankPct}
          progressTone="gold"
        />
        <CockpitCard
          icon={Scale}
          tone="success"
          label="Поймано расхождений"
          value={<span className="tnum">{fmtKzt(kpi.caughtKzt)}</span>}
          sub="за месяц · план 10 млн"
          progress={Math.min(100, Math.round((kpi.caughtKzt / 15_000_000) * 100))}
          progressTone="success"
          right={<DeltaChip v={18} />}
        />
        <CockpitCard
          icon={FileCheck2}
          tone="primary"
          label="Актов принято в срок"
          value={
            <span className="tnum">
              38<span className="text-sm font-semibold text-muted-foreground">/42</span>
            </span>
          }
          sub="90% · SLA ≤ 3 дней"
          progress={90}
          progressTone="primary"
        />
        <CockpitCard
          icon={Ruler}
          tone="warning"
          label="Ведомостей сверено"
          value={<span className="tnum">{kpi.volumesChecked}</span>}
          sub="обмеров за месяц"
          progress={78}
          progressTone="warning"
          right={<DeltaChip v={6} />}
        />
      </section>

      {/* На приёмке сегодня */}
      <section className="mt-6">
        <SectionTitle icon={Timer} title="На приёмке сегодня" hint="3 действия ждут решения" />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <BigActionCard
            tone="danger"
            icon={FileWarning}
            title="Расхождение факт/смета"
            desc="АКТ-0421 · кладка +8 м³ · ≈ 336 тыс ₸"
            meta="СтройМонолит · Аура · Б1"
            action="Вернуть"
            onAction={() => flash("Акт возвращён подрядчику с замечанием")}
          />
          <BigActionCard
            tone="warning"
            icon={Ruler}
            title="Объём к обмеру"
            desc="Стяжка холла · +15 м² спорно"
            meta="СтройМонолит · Аура · Б1"
            action="Проверить"
            onAction={() => flash("+20 XP · Обмер назначен на сегодня")}
          />
          <BigActionCard
            tone="success"
            icon={Handshake}
            title="Бартер к учёту"
            desc="Работы 24 млн ₸ ⇄ 2 кв · 54 м²"
            meta="МастерФасад · Аксай"
            action="Оформить"
            onAction={() => flash("+30 XP · Взаимозачёт оформлен")}
          />
        </div>
      </section>

      {/* KPI компактно */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MiniStat icon={FileCheck2} label="Актов на приёмке" value={kpi.onAcceptance} />
        <MiniStat icon={Scale} label="Поймано, ₸" value={fmtKzt(kpi.caughtKzt)} tone="success" />
        <MiniStat icon={Ruler} label="Сверено объёмов" value={kpi.volumesChecked} />
        <MiniStat icon={CircleAlert} label="Спорных позиций" value={kpi.disputed} tone="warning" />
        <MiniStat icon={Timer} label="Ср. срок приёмки" value={`${kpi.avgDaysAcceptance} дн`} />
      </section>

      {/* Приёмка актов */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle icon={FileCheck2} title="Приёмка актов" hint="факт vs смета" inline />
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "over", "dispute", "match"] as const).map((s) => {
              const active = statusFilter === s;
              const label =
                s === "all" ? "Все" : s === "over" ? "🔴 Завышение" : s === "dispute" ? "🟡 Спорно" : "🟢 Сходится";
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-background text-muted-foreground ring-border hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Acts list */}
          <ul className="space-y-2">
            {acts.map((a) => {
              const active = a.id === activeAct;
              const over = a.rows.filter((r) => r.status === "over").length;
              const disp = a.rows.filter((r) => r.status === "dispute").length;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setActiveAct(a.id)}
                    className={`group w-full rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="tnum text-xs font-bold">{a.id}</span>
                      <span className="tnum text-[11px] text-muted-foreground">{a.date}</span>
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold">{a.contractor}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {a.object} · {a.block}
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {over > 0 ? <Chip tone="danger">{over} завыш.</Chip> : null}
                      {disp > 0 ? <Chip tone="warning">{disp} спорн.</Chip> : null}
                      {over === 0 && disp === 0 ? <Chip tone="success">чисто</Chip> : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Rows table */}
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SmallStat label="Смета" value={fmtKzt(actTotals.planSum)} />
              <SmallStat label="Факт" value={fmtKzt(actTotals.factSum)} />
              <SmallStat label="Завышение" value={fmtKzt(actTotals.overSum)} tone="danger" />
              <SmallStat label="Спорно (по ₸)" value={fmtKzt(actTotals.disputeSum)} tone="warning" />
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <div className="hidden grid-cols-[minmax(0,1.6fr)_80px_90px_90px_110px_130px] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                <span>Позиция</span>
                <span className="text-right">Ед.</span>
                <span className="text-right">Смета</span>
                <span className="text-right">Факт</span>
                <span className="text-right">Δ, ₸</span>
                <span className="text-right">Статус</span>
              </div>
              <ul className="divide-y divide-border">
                {rowsFiltered.length === 0 ? (
                  <li className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" /> Нет позиций в этом статусе
                  </li>
                ) : (
                  rowsFiltered.map((r) => {
                    const meta = rowStatusMeta[r.status];
                    const delta = (r.factQty - r.planQty) * r.price;
                    return (
                      <li
                        key={r.id}
                        className={`grid grid-cols-2 gap-1 px-3 py-3 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1.6fr)_80px_90px_90px_110px_130px] md:items-center md:gap-2`}
                      >
                        <div className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{r.name}</div>
                            {r.note ? (
                              <div className="truncate text-[11px] text-muted-foreground">
                                {r.note}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="tnum text-right text-xs text-muted-foreground md:text-sm">
                          <span className="md:hidden">ед: </span>
                          {r.unit}
                        </div>
                        <div className="tnum text-right text-xs md:text-sm">
                          <span className="md:hidden text-muted-foreground">см: </span>
                          {r.planQty}
                        </div>
                        <div className="tnum text-right text-xs font-semibold md:text-sm">
                          <span className="md:hidden text-muted-foreground">факт: </span>
                          {r.factQty}
                        </div>
                        <div
                          className={`tnum text-right text-xs font-bold md:text-sm ${
                            delta > 0 ? "text-destructive" : delta < 0 ? "text-success" : "text-muted-foreground"
                          }`}
                        >
                          {delta > 0 ? "+" : ""}
                          {fmtKzt(delta)}
                        </div>
                        <div className="col-span-2 flex justify-start md:col-span-1 md:justify-end">
                          <Chip tone={meta.tone} icon={meta.icon}>
                            {meta.label}
                          </Chip>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => flash("Акт возвращён подрядчику")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10"
              >
                <ArrowDownRight className="h-4 w-4" /> Вернуть
              </button>
              <button
                onClick={() => flash("+20 XP · Обмер назначен")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs font-bold text-warning transition-colors hover:bg-warning/10"
              >
                <Ruler className="h-4 w-4" /> Обмер
              </button>
              <button
                onClick={() => flash("+40 XP · Акт принят")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-primary to-accent px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md"
              >
                <CheckCircle2 className="h-4 w-4" /> Принять
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Бартер по подрядчикам */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            icon={Handshake}
            title="Бартер: работы ⇄ квартиры"
            hint="накопитель по подрядчикам"
            inline
          />
          <div className="flex flex-wrap gap-2">
            <SmallStat label="Работы всего" value={fmtKzt(barterTotals.works)} />
            <SmallStat label="В зачёт" value={fmtKzt(barterTotals.barter)} tone="warning" />
            <SmallStat label="М²" value={`${barterTotals.meters} м²`} />
            <SmallStat label="Квартир" value={barterTotals.apts} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {contractorsBarter.map((c) => {
            const pct = Math.round((c.barter / c.works) * 100);
            const pricePerM2 = c.aptMeters > 0 ? c.barter / c.aptMeters : 0;
            return (
              <div
                key={c.name}
                className="group rounded-xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{c.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {c.project}
                    </div>
                  </div>
                  <Chip tone={pct >= 60 ? "warning" : pct >= 40 ? "primary" : "success"}>
                    <span className="tnum">{pct}% в зачёт</span>
                  </Chip>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Работы</div>
                    <div className="tnum text-sm font-black">{fmtKzt(c.works)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Бартер</div>
                    <div className="tnum text-sm font-black text-warning">{fmtKzt(c.barter)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Home className="h-3 w-3" /> Квартир
                    </div>
                    <div className="tnum text-sm font-black">
                      {c.aptCount} <span className="text-xs font-semibold text-muted-foreground">· {c.aptMeters} м²</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Coins className="h-3 w-3" /> ₸/м²
                    </div>
                    <div className="tnum text-sm font-black">
                      {Math.round(pricePerM2 / 1000)} тыс
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar
                    pct={pct}
                    tone={pct >= 60 ? "warning" : pct >= 40 ? "primary" : "success"}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    доля бартера в договоре
                  </span>
                  <button
                    onClick={() => flash(`Открыт свод по «${c.name}»`)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary transition-transform group-hover:translate-x-0.5"
                  >
                    Свод <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Достижения + лидерборд */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle icon={Trophy} title="Достижения ПТО" hint="твой прогресс" inline />
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
                    <div className="truncate text-[11px] text-muted-foreground">{a.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle icon={Crown} title="Лидерборд ПТО" hint="месяц · по расхождениям" inline />
          <ul className="mt-3 space-y-2">
            {leaderboard.map((p, i) => (
              <li
                key={p.name}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  p.you
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
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                    {p.you ? <Chip tone="primary">ты</Chip> : null}
                  </div>
                  <div className="tnum mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
                    <span>актов {p.acts}</span>
                    <span>ср. срок {p.avgDays} дн</span>
                  </div>
                </div>
                <div className="tnum text-lg font-black text-success">
                  {p.caught.toFixed(1)} <span className="text-[11px] font-semibold text-muted-foreground">млн ₸</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Nav footer */}
      <section className="mt-6 grid gap-2 sm:grid-cols-3">
        <FooterLink to="/rp" icon={HardHat} title="Пульт РП" desc="эскалация замечаний" />
        <FooterLink to="/foreman" icon={MessageSquare} title="Мастер" desc="исправления на месте" />
        <FooterLink to="/finance" icon={Coins} title="Финансы" desc="приход/расход по актам" />
      </section>
    </div>
  );
}

// ---------- shared UI ----------

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
  right,
}: {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  value: React.ReactNode;
  sub: string;
  progress: number;
  progressTone: Tone;
  right?: React.ReactNode;
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${iconBg}`}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
        {right}
      </div>
      <div className="mt-2 text-2xl font-black leading-none sm:text-3xl">{value}</div>
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

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: Tone;
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`tnum mt-1 text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`tnum text-sm font-black ${color}`}>{value}</div>
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
