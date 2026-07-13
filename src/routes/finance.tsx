import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Wallet,
  Coins,
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
  FileCheck2,
  FileWarning,
  Search,
  Timer,
  Banknote,
  Receipt,
  Landmark,
  ClipboardCheck,
  UserCheck,
  Scale,
  ChevronRight,
  Eye,
  Ban,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Финансы и акты — ATLAS · ATAMURA" },
      {
        name: "description",
        content:
          "Финконтроль: приёмка КС-2/КС-3/АВР, аудит СБ, казначейство и лидерборд финотдела.",
      },
      { property: "og:title", content: "Финансы и акты — ATLAS · ATAMURA" },
      {
        property: "og:description",
        content:
          "Финконтроль: приёмка КС-2/КС-3/АВР, аудит СБ, казначейство и лидерборд финотдела.",
      },
    ],
  }),
  component: FinanceDesk,
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

function fmtKzt(n: number) {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} млрд ₸`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₸`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} тыс ₸`;
  return `${n} ₸`;
}

// ---------- data ----------

type Verdict = "clean" | "suspect" | "rework";

type ActRow = {
  id: string;
  kind: "КС-2" | "КС-3" | "АВР";
  contractor: string;
  object: string;
  amount: number;
  caught: number; // ₸ caught overstatements
  verdict: Verdict;
  stage: number; // 0..6 route step
  age: number; // days
};

const acts: ActRow[] = [
  { id: "КС2-0812", kind: "КС-2", contractor: 'ТОО "АлюмФасад"', object: "Аура", amount: 184_000_000, caught: 3_200_000, verdict: "rework", stage: 2, age: 4 },
  { id: "КС3-0341", kind: "КС-3", contractor: 'ТОО "Монолит-KZ"', object: "Атмосфера", amount: 246_000_000, caught: 0, verdict: "clean", stage: 5, age: 2 },
  { id: "КС2-0813", kind: "КС-2", contractor: 'ТОО "ЭлектроСтрой"', object: "Керуен", amount: 92_500_000, caught: 1_100_000, verdict: "suspect", stage: 3, age: 3 },
  { id: "АВР-1204", kind: "АВР", contractor: 'ТОО "АлюмФасад"', object: "Аксай", amount: 38_400_000, caught: 0, verdict: "clean", stage: 6, age: 1 },
  { id: "КС2-0814", kind: "КС-2", contractor: 'ТОО "Монолит-KZ"', object: "Аура", amount: 128_000_000, caught: 2_600_000, verdict: "suspect", stage: 1, age: 5 },
  { id: "КС3-0342", kind: "КС-3", contractor: 'ТОО "ЭлектроСтрой"', object: "Атмосфера", amount: 74_800_000, caught: 480_000, verdict: "rework", stage: 0, age: 6 },
];

const routeSteps: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "rambo", label: "Рэмбо", icon: FileCheck2 },
  { key: "pto", label: "Инженер ПТО", icon: ClipboardCheck },
  { key: "sherlock", label: "Шерлок · СБ", icon: Search },
  { key: "rp", label: "РП", icon: UserCheck },
  { key: "director", label: "Директор", icon: Crown },
  { key: "findir", label: "Финдир", icon: Landmark },
  { key: "pay", label: "Оплата", icon: Banknote },
];

type Payment = {
  id: string;
  contractor: string;
  amount: number;
  due: string;
  status: "queue" | "paid" | "late" | "hold";
};

const payments: Payment[] = [
  { id: "PAY-1012", contractor: 'ТОО "АлюмФасад"', amount: 42_000_000, due: "12.07", status: "queue" },
  { id: "PAY-1013", contractor: 'ТОО "Монолит-KZ"', amount: 118_000_000, due: "12.07", status: "queue" },
  { id: "PAY-1010", contractor: 'ТОО "ЭлектроСтрой"', amount: 24_600_000, due: "10.07", status: "late" },
  { id: "PAY-1008", contractor: 'ТОО "Монолит-KZ"', amount: 62_400_000, due: "09.07", status: "paid" },
  { id: "PAY-1014", contractor: 'ТОО "АлюмФасад"', amount: 18_900_000, due: "14.07", status: "hold" },
];

const paymentMeta: Record<Payment["status"], { tone: Tone; label: string; icon: LucideIcon }> = {
  queue: { tone: "primary", label: "В очереди", icon: Timer },
  paid: { tone: "success", label: "Оплачено", icon: CheckCircle2 },
  late: { tone: "danger", label: "Просрочка", icon: AlertTriangle },
  hold: { tone: "warning", label: "На удержании", icon: Ban },
};

const verdictMeta: Record<Verdict, { tone: Tone; label: string; dot: string; icon: LucideIcon }> = {
  clean: { tone: "success", label: "Чисто", dot: "bg-success", icon: CheckCircle2 },
  suspect: { tone: "warning", label: "Подозрение", dot: "bg-warning", icon: CircleAlert },
  rework: { tone: "danger", label: "Доработка", dot: "bg-destructive", icon: AlertTriangle },
};

const achievements = [
  { icon: Scale, title: "Спасено 10 млн ₸", desc: "Пойманные завышения / месяц", unlocked: true, tone: "success" as Tone },
  { icon: Timer, title: "Согласование ≤ 3 дн.", desc: "20 актов подряд", unlocked: true, tone: "primary" as Tone },
  { icon: ShieldCheck, title: "0 оплат мимо аудита", desc: "45 дней streak", unlocked: true, tone: "danger" as Tone },
  { icon: Trophy, title: "Кассовая точность 100%", desc: "Месяц без разрывов", unlocked: false, tone: "gold" as Tone },
];

const leaderboard = [
  { name: "Ж. Абдрахман", you: true, saved: 8.4, acts: 46, avgDays: 2.4 },
  { name: "М. Тлеубердин", you: false, saved: 7.9, acts: 51, avgDays: 2.6 },
  { name: "К. Сагатова", you: false, saved: 6.2, acts: 39, avgDays: 2.9 },
  { name: "Р. Ахметов", you: false, saved: 4.8, acts: 33, avgDays: 3.2 },
];

// ---------- PAGE ----------

function FinanceDesk() {
  const [verdictFilter, setVerdictFilter] = useState<"all" | Verdict>("all");
  const [selected, setSelected] = useState(acts[0].id);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const filteredActs = acts.filter((a) => verdictFilter === "all" || a.verdict === verdictFilter);
  const selectedAct = acts.find((a) => a.id === selected) ?? acts[0];

  const kpi = useMemo(() => {
    const toPay = payments
      .filter((p) => p.status !== "paid")
      .reduce((s, p) => s + p.amount, 0);
    const inReview = acts.length;
    const caughtTotal = acts.reduce((s, a) => s + a.caught, 0);
    const latePayments = payments.filter((p) => p.status === "late").length;
    const avgDays =
      Math.round(
        (acts.reduce((s, a) => s + a.age, 0) / acts.length) * 10,
      ) / 10;
    return { toPay, inReview, caughtTotal, latePayments, avgDays };
  }, []);

  const rank = { level: 6, xp: 1340, next: 1600 };
  const rankPct = Math.round((rank.xp / rank.next) * 100);
  const streak = 45;
  const savedGoal = 12;
  const savedNow = 8.4;
  const actsInTime = { done: 46, total: 51 };
  const cashDiscipline = 94;

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
            <Wallet className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
              Финансы и акты
            </h1>
            <p className="tnum truncate text-xs text-muted-foreground sm:text-sm">
              Финконтроль · КС-2 / КС-3 / АВР · казначейство · аудит СБ
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
            <span className="tnum">Спасено {savedNow} млн ₸</span>
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
          sub={`Финконтролёр · уровень ${rank.level}`}
          progress={rankPct}
          progressTone="gold"
        />
        <CockpitCard
          icon={Scale}
          tone="success"
          label="Спасено денег"
          value={
            <span className="tnum">
              {savedNow}
              <span className="text-sm font-semibold text-muted-foreground">
                /{savedGoal} млн ₸
              </span>
            </span>
          }
          sub="пойманные завышения"
          progress={Math.round((savedNow / savedGoal) * 100)}
          progressTone="success"
          right={<DeltaChip v={22} />}
        />
        <CockpitCard
          icon={FileCheck2}
          tone="primary"
          label="Акты в срок"
          value={
            <span className="tnum">
              {actsInTime.done}
              <span className="text-sm font-semibold text-muted-foreground">
                /{actsInTime.total}
              </span>
            </span>
          }
          sub={`${Math.round((actsInTime.done / actsInTime.total) * 100)}% SLA ≤ 3 дн.`}
          progress={Math.round((actsInTime.done / actsInTime.total) * 100)}
          progressTone="primary"
        />
        <CockpitCard
          icon={ShieldCheck}
          tone="danger"
          label="Кассовая дисциплина"
          value={<span className="tnum">{cashDiscipline}%</span>}
          sub={`${streak} дн. без оплаты мимо СБ`}
          progress={cashDiscipline}
          progressTone={cashDiscipline >= 95 ? "success" : "danger"}
        />
      </section>

      {/* На контроле сегодня */}
      <section className="mt-6">
        <SectionTitle icon={Timer} title="На контроле сегодня" hint="3 решения ждут" />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <BigActionCard
            tone="danger"
            icon={FileWarning}
            title="Красный вердикт СБ"
            desc="КС2-0812 · АлюмФасад · завышение ≈ 3.2 млн ₸"
            meta="Шерлок · Аура · возраст 4 дн"
            action="Вернуть на доработку"
            onAction={() => flash("Акт возвращён · подрядчик уведомлён")}
          />
          <BigActionCard
            tone="primary"
            icon={Banknote}
            title="Оплата к проведению"
            desc="PAY-1013 · Монолит-KZ · 118 млн ₸"
            meta="согласовано финдиром · срок сегодня"
            action="Провести"
            onAction={() => flash("+40 XP · Платёж отправлен в казначейство")}
          />
          <BigActionCard
            tone="warning"
            icon={CircleAlert}
            title="Подозрение на завышение"
            desc="КС2-0814 · Монолит-KZ · 2.6 млн ₸ спорно"
            meta="Рэмбо → ПТО → Шерлок · возраст 5 дн"
            action="Проверить"
            onAction={() => flash("+25 XP · Взято на аудит СБ")}
          />
        </div>
      </section>

      {/* KPI mini */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MiniStat icon={Banknote} label="К оплате" value={fmtKzt(kpi.toPay)} />
        <MiniStat icon={FileCheck2} label="Актов на согл." value={kpi.inReview} />
        <MiniStat
          icon={Scale}
          label="Поймано завышений"
          value={fmtKzt(kpi.caughtTotal)}
          tone="success"
        />
        <MiniStat
          icon={AlertTriangle}
          label="Просроченные оплаты"
          value={kpi.latePayments}
          tone="danger"
        />
        <MiniStat icon={Timer} label="Ср. срок согл." value={`${kpi.avgDays} дн`} />
      </section>

      {/* Реестр актов + маршрут */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={Receipt} title="Реестр закрывающих" hint="КС-2 · КС-3 · АВР" inline />
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "rework", "suspect", "clean"] as const).map((s) => {
                const active = verdictFilter === s;
                const label =
                  s === "all"
                    ? "Все"
                    : s === "rework"
                      ? "🔴 Доработка"
                      : s === "suspect"
                        ? "🟡 Подозрение"
                        : "🟢 Чисто";
                return (
                  <button
                    key={s}
                    onClick={() => setVerdictFilter(s)}
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

          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[70px_minmax(0,1.6fr)_100px_110px_110px_140px] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
              <span>Тип</span>
              <span>Подрядчик · Объект</span>
              <span className="text-right">Сумма</span>
              <span className="text-right">Поймано</span>
              <span className="text-right">Возраст</span>
              <span className="text-right">Вердикт</span>
            </div>
            <ul className="divide-y divide-border">
              {filteredActs.length === 0 ? (
                <li className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" /> Нет актов в этом статусе
                </li>
              ) : (
                filteredActs.map((a) => {
                  const v = verdictMeta[a.verdict];
                  const active = a.id === selected;
                  return (
                    <li key={a.id}>
                      <button
                        onClick={() => setSelected(a.id)}
                        className={`grid w-full grid-cols-2 gap-1 px-3 py-3 text-left transition-colors md:grid-cols-[70px_minmax(0,1.6fr)_100px_110px_110px_140px] md:items-center md:gap-2 ${
                          active ? "bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${v.dot}`} />
                          <span className="tnum text-xs font-bold text-primary md:text-sm">
                            {a.kind}
                          </span>
                        </div>
                        <div className="col-span-2 min-w-0 md:col-span-1">
                          <div className="truncate text-sm font-semibold">{a.contractor}</div>
                          <div className="tnum flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Building2 className="h-3 w-3" /> {a.object} · {a.id}
                          </div>
                        </div>
                        <div className="tnum text-right text-xs font-black md:text-sm">
                          <span className="md:hidden text-muted-foreground">Σ: </span>
                          {fmtKzt(a.amount)}
                        </div>
                        <div
                          className={`tnum text-right text-xs md:text-sm ${
                            a.caught > 0 ? "font-bold text-success" : "text-muted-foreground"
                          }`}
                        >
                          <span className="md:hidden text-muted-foreground">поймано: </span>
                          {a.caught > 0 ? fmtKzt(a.caught) : "—"}
                        </div>
                        <div className="tnum text-right text-xs text-muted-foreground md:text-sm">
                          <span className="md:hidden">возраст: </span>
                          {a.age} дн
                        </div>
                        <div className="col-span-2 flex items-center justify-start gap-1.5 md:col-span-1 md:justify-end">
                          <Chip tone={v.tone} icon={v.icon}>
                            {v.label}
                          </Chip>
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground/60 transition-transform ${
                              active ? "translate-x-0.5 text-primary" : ""
                            }`}
                          />
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* Route stepper */}
        <aside className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle icon={ClipboardCheck} title="Маршрут приёмки" hint={selectedAct.id} inline />
          <div className="mt-2 flex items-center gap-2">
            <span className="tnum text-xs font-bold text-primary">{selectedAct.kind}</span>
            <span className="truncate text-xs text-muted-foreground">
              {selectedAct.contractor}
            </span>
          </div>
          <ol className="mt-4 space-y-2">
            {routeSteps.map((s, i) => {
              const done = i < selectedAct.stage;
              const current = i === selectedAct.stage;
              const Icon = s.icon;
              return (
                <li
                  key={s.key}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                    done
                      ? "border-success/25 bg-success/5"
                      : current
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      done
                        ? "bg-success text-success-foreground"
                        : current
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {done ? "пройдено" : current ? "сейчас здесь" : "ожидает"}
                    </div>
                  </div>
                  {current ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => flash("Открыт лог маршрута")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted"
            >
              <Eye className="h-4 w-4" /> Лог
            </button>
            <button
              onClick={() => flash("+30 XP · Двинули по маршруту")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-primary to-accent px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              Двинуть дальше <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </section>

      {/* Реестр платежей казначейства */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <SectionTitle
          icon={Landmark}
          title="Казначейство · реестр платежей"
          hint={`${payments.length} операций`}
          inline
        />
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <div className="hidden grid-cols-[100px_minmax(0,1.4fr)_140px_100px_140px] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
            <span>№</span>
            <span>Подрядчик</span>
            <span className="text-right">Сумма</span>
            <span className="text-right">Срок</span>
            <span className="text-right">Статус</span>
          </div>
          <ul className="divide-y divide-border">
            {payments.map((p) => {
              const meta = paymentMeta[p.status];
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-2 gap-1 px-3 py-3 transition-colors hover:bg-muted/30 md:grid-cols-[100px_minmax(0,1.4fr)_140px_100px_140px] md:items-center md:gap-2"
                >
                  <span className="tnum text-xs font-bold text-primary md:text-sm">{p.id}</span>
                  <span className="col-span-2 truncate text-sm font-semibold md:col-span-1">
                    {p.contractor}
                  </span>
                  <span className="tnum text-right text-sm font-black">{fmtKzt(p.amount)}</span>
                  <span className="tnum text-right text-xs text-muted-foreground md:text-sm">
                    {p.due}
                  </span>
                  <div className="col-span-2 flex justify-start md:col-span-1 md:justify-end">
                    <Chip tone={meta.tone} icon={meta.icon}>
                      {meta.label}
                    </Chip>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Достижения + лидерборд */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <SectionTitle icon={Trophy} title="Достижения финотдела" hint="твой прогресс" inline />
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
          <SectionTitle icon={Crown} title="Лидерборд финотдела" hint="месяц · по спасённым ₸" inline />
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
                  {p.saved.toFixed(1)}{" "}
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    млн ₸
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Nav footer */}
      <section className="mt-6 grid gap-2 sm:grid-cols-3">
        <FooterLink to="/pto" icon={ClipboardCheck} title="ПТО и бартер" desc="возврат объёмов" />
        <FooterLink to="/supply" icon={Package} title="Снабжение" desc="контроль закупок" />
        <FooterLink to="/portfolio" icon={Coins} title="Портфель" desc="ROI и маржа объектов" />
      </section>
    </div>
  );
}

// ---------- shared UI ----------

function SectionTitle({
  icon: Icon,
  title,
  hint,
  inline: _inline = false,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  inline?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
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
