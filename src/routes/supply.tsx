import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Flame,
  Zap,
  ShoppingCart,
  Scale,
  BellRing,
  Trophy,
  Target,
  PiggyBank,
  CalendarCheck,
  CheckCircle2,
  Circle,
} from "lucide-react";

export const Route = createFileRoute("/supply")({
  head: () => ({
    meta: [
      { title: "Снабжение — ATLAS · ATAMURA" },
      { name: "description", content: "Cockpit снабженца: обеспеченность фронта работ, конвейер закупа и реестр заявок." },
      { property: "og:title", content: "Снабжение — ATLAS · ATAMURA" },
      { property: "og:description", content: "Cockpit снабженца: обеспеченность фронта, конвейер закупа, реестр заявок." },
    ],
  }),
  component: SupplyPage,
});

/* ---------- mock data ---------- */

const goals = [
  { label: "Обеспеченность фронта", value: 82, target: 95, unit: "%", icon: Target },
  { label: "Заказы в срок", value: 46, target: 51, unit: "", icon: CalendarCheck },
  { label: "Экономия против сметы", value: 8.4, target: 10, unit: " млн ₸", icon: PiggyBank },
];

const fires = [
  {
    title: "Просрочен заказ бетона B25",
    detail: "ЖК Аура, Блок 2 · плита 9 этажа встанет через 2 дня",
    action: "Заказать сейчас",
    tone: "destructive" as const,
  },
  {
    title: "Фасадные витражи: 3 КП получено",
    detail: "ЖК Атмосфера · разница цен 14% · решение до пятницы",
    action: "Выбрать поставщика",
    tone: "accent" as const,
  },
  {
    title: "Заявка №1287 висит на РП 4 дня",
    detail: "Кабель ВВГнг · Ержан К. не согласовал",
    action: "Толкнуть согласование",
    tone: "accent" as const,
  },
];

const kpis = [
  { label: "Открытых заявок", value: "34" },
  { label: "На согласовании", value: "11" },
  { label: "Сумма в работе", value: "486 млн ₸" },
  { label: "Срочных рисков", value: "7", danger: true },
  { label: "Оборачиваемость закупа", value: "12 дн" },
];

type FrontStatus = "overdue" | "urgent" | "ok" | "flow";

const statusMeta: Record<FrontStatus, { label: string; cls: string }> = {
  overdue: { label: "🔴 Просрочен", cls: "bg-destructive/10 text-destructive" },
  urgent: { label: "🟡 Срочно", cls: "bg-warning/25 text-accent-foreground" },
  ok: { label: "🟢 Обеспечено", cls: "bg-success/10 text-success" },
  flow: { label: "🔵 Фронт идёт", cls: "bg-info/10 text-info" },
};

const frontRows = [
  { material: "Бетон B25", project: "Аура", block: "Блок 2", work: "Плита перекрытия, 9 эт.", needBy: "15 июл", orderBy: "11 июл", status: "overdue" as FrontStatus },
  { material: "Арматура A500, Ø12", project: "Аура", block: "Блок 3", work: "Каркас колонн, 5 эт.", needBy: "19 июл", orderBy: "14 июл", status: "urgent" as FrontStatus },
  { material: "Фасадные витражи", project: "Атмосфера", block: "Блок 1", work: "Остекление, 1–4 эт.", needBy: "02 авг", orderBy: "16 июл", status: "urgent" as FrontStatus },
  { material: "Лифты (4 шт)", project: "Керуен", block: "Блок 1", work: "Монтаж лифтов", needBy: "20 сен", orderBy: "25 июл", status: "ok" as FrontStatus },
  { material: "Кабель ВВГнг 3×2.5", project: "Аксай", block: "Блок 2", work: "Электромонтаж, 1–9 эт.", needBy: "28 июл", orderBy: "18 июл", status: "flow" as FrontStatus },
  { material: "Бетон B25", project: "Керуен", block: "Блок 2", work: "Фундаментная плита", needBy: "22 июл", orderBy: "17 июл", status: "ok" as FrontStatus },
  { material: "Арматура A500, Ø16", project: "Атмосфера", block: "Блок 2", work: "Стены подвала", needBy: "25 июл", orderBy: "19 июл", status: "flow" as FrontStatus },
];

const projects = ["Все ЖК", "Аура", "Атмосфера", "Керуен", "Аксай"];

const pipeline: { stage: string; cards: { title: string; sum: string; who: string }[] }[] = [
  {
    stage: "Черновик",
    cards: [
      { title: "Гидроизоляция кровли", sum: "6,2 млн ₸", who: "Алия Ж." },
      { title: "Двери входные, 96 шт", sum: "18,4 млн ₸", who: "Тимур Б." },
    ],
  },
  {
    stage: "Согласование",
    cards: [
      { title: "Кабель ВВГнг 3×2.5", sum: "4,1 млн ₸", who: "Ержан К." },
      { title: "Арматура A500, Ø12", sum: "22,8 млн ₸", who: "Данияр А." },
    ],
  },
  {
    stage: "Тендер",
    cards: [{ title: "Фасадные витражи", sum: "96,0 млн ₸", who: "3 КП получено" }],
  },
  {
    stage: "Договор",
    cards: [{ title: "Лифты, 4 шт", sum: "148,0 млн ₸", who: "KazLift LLP" }],
  },
  {
    stage: "Поставка",
    cards: [
      { title: "Бетон B25, 240 м³", sum: "9,6 млн ₸", who: "график до 20 июл" },
      { title: "Утеплитель 100 мм", sum: "7,3 млн ₸", who: "в пути, 2 фуры" },
    ],
  },
  {
    stage: "Закрыто",
    cards: [{ title: "Опалубка (аренда)", sum: "3,8 млн ₸", who: "принято на склад" }],
  },
];

const chainSteps = ["Муравей", "Инициатор", "РП", "Директор", "Снабжение", "Финдир", "Оплата"];

const requests = [
  { id: "№1294", title: "Бетон B25, 180 м³", project: "Аура", sum: "7,2 млн ₸", step: 5 },
  { id: "№1291", title: "Фасадные витражи", project: "Атмосфера", sum: "96,0 млн ₸", step: 4 },
  { id: "№1287", title: "Кабель ВВГнг 3×2.5", project: "Аксай", sum: "4,1 млн ₸", step: 3 },
  { id: "№1283", title: "Лифты, 4 шт", project: "Керуен", sum: "148,0 млн ₸", step: 7 },
  { id: "№1278", title: "Арматура A500, Ø16", project: "Атмосфера", sum: "12,5 млн ₸", step: 6 },
];

const wins = [
  { text: "Динара М. сэкономила 2,1 млн ₸ на тендере по витражам", xp: "+120 XP" },
  { text: "Кайрат Б. закрыл поставку бетона за 1 день вместо 3", xp: "+80 XP" },
  { text: "Алия Ж. провела заявку по кабелю без единого возврата", xp: "+60 XP" },
  { text: "Команда: 17 дней стройка не встала из-за материалов", xp: "+200 XP" },
];

/* ---------- page ---------- */

function SupplyPage() {
  const [project, setProject] = useState("Все ЖК");
  const rows = project === "Все ЖК" ? frontRows : frontRows.filter((r) => r.project === project);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Cockpit header */}
      <div className="card-soft relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-soft/60 blur-2xl" />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_1.6fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground/70">
              Cockpit снабженца
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Снабжение
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
                <Trophy className="h-3.5 w-3.5" /> Ранг: Золото
              </span>
              <span className="tnum rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                2 450 / 3 000 XP до Платины
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-linear-to-r from-accent to-success" style={{ width: "82%" }} />
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <Zap className="h-3.5 w-3.5" /> Streak: 17 дней стройка не встала из-за материалов
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {goals.map((g) => (
              <div key={g.label} className="rounded-xl border border-border bg-background/70 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <g.icon className="h-3.5 w-3.5" /> {g.label}
                </div>
                <div className="tnum mt-2 text-xl font-extrabold">
                  {g.value}
                  {g.unit}
                  <span className="text-sm font-semibold text-muted-foreground"> / {g.target}{g.unit}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (g.value / g.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Пожары дня */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide">
          <Flame className="h-4 w-4 text-destructive" /> Пожары дня
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {fires.map((f) => (
            <div
              key={f.title}
              className={`card-soft flex flex-col gap-3 p-4 ${f.tone === "destructive" ? "border-destructive/40" : ""}`}
            >
              <div>
                <div className="text-sm font-extrabold leading-snug">{f.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
              </div>
              <button
                type="button"
                className={`mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  f.tone === "destructive"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <BellRing className="h-3.5 w-3.5" /> {f.action}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="card-soft p-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className={`tnum mt-1.5 text-2xl font-extrabold ${k.danger ? "text-destructive" : ""}`}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Обеспеченность фронта */}
      <section className="card-soft overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-base font-extrabold tracking-tight">Обеспеченность фронта работ</h2>
          <div className="flex flex-wrap gap-1.5">
            {projects.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProject(p)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  project === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 sm:px-5">Материал</th>
                <th className="px-3 py-2.5">Объект / блок</th>
                <th className="px-3 py-2.5">Под работу</th>
                <th className="px-3 py-2.5">Нужно к</th>
                <th className="px-3 py-2.5">Заказать до</th>
                <th className="px-3 py-2.5">Статус</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/50">
                  <td className="px-4 py-3 font-bold sm:px-5">{r.material}</td>
                  <td className="px-3 py-3 text-muted-foreground">ЖК {r.project} · {r.block}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.work}</td>
                  <td className="tnum px-3 py-3 font-semibold">{r.needBy}</td>
                  <td className="tnum px-3 py-3 font-semibold">{r.orderBy}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusMeta[r.status].cls}`}>
                      {statusMeta[r.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <ShoppingCart className="h-3 w-3" /> Заказать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Конвейер закупа */}
      <section>
        <h2 className="mb-3 text-base font-extrabold tracking-tight">Конвейер закупа</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pipeline.map((col) => (
            <div key={col.stage} className="w-56 shrink-0 rounded-xl bg-secondary/70 p-2.5">
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{col.stage}</span>
                <span className="tnum rounded-full bg-card px-1.5 text-[10px] font-bold text-muted-foreground">
                  {col.cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.cards.map((c) => (
                  <div key={c.title} className="rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
                    <div className="text-xs font-bold leading-snug">{c.title}</div>
                    <div className="tnum mt-1 text-xs font-extrabold text-accent-foreground/90">{c.sum}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{c.who}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        {/* Реестр заявок */}
        <section className="card-soft p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-extrabold tracking-tight">Реестр заявок</h2>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <Scale className="h-3 w-3" /> цепочка: {chainSteps.join(" → ")}
            </span>
          </div>
          <ul className="mt-4 space-y-4">
            {requests.map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-3.5 transition-colors hover:bg-secondary/40">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <span className="tnum text-xs font-bold text-muted-foreground">{r.id}</span>{" "}
                    <span className="font-bold">{r.title}</span>
                    <span className="text-xs text-muted-foreground"> · ЖК {r.project}</span>
                  </div>
                  <span className="tnum text-sm font-extrabold">{r.sum}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1">
                  {chainSteps.map((step, si) => {
                    const done = si < r.step;
                    const current = si === r.step;
                    return (
                      <div key={step} className="flex flex-1 items-center gap-1" title={step}>
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : (
                          <Circle className={`h-3.5 w-3.5 shrink-0 ${current ? "text-accent-foreground" : "text-border"}`} />
                        )}
                        {si < chainSteps.length - 1 && (
                          <div className={`h-0.5 flex-1 rounded ${done ? "bg-success/50" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-1.5 text-[10px] font-semibold text-muted-foreground">
                  {r.step >= chainSteps.length
                    ? "Оплачено ✓"
                    : `Сейчас: ${chainSteps[r.step]}`}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Лента побед */}
        <section className="card-soft h-fit p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            <Trophy className="h-4 w-4 text-accent-foreground/80" /> Лента побед смены
          </h2>
          <ul className="mt-4 space-y-3">
            {wins.map((w) => (
              <li key={w.text} className="flex items-start justify-between gap-3 rounded-xl bg-secondary/60 p-3">
                <p className="text-xs leading-snug">{w.text}</p>
                <span className="tnum shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-extrabold text-accent-foreground">
                  {w.xp}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
