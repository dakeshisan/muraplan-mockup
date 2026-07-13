import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  PackagePlus,
  AlertOctagon,
  ClipboardCheck,
  Home,
  Plus,
  ListChecks,
  Inbox,
  UserCircle,
  Wifi,
  WifiOff,
  RotateCw,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  Sun,
  ArrowLeft,
  AlertTriangle,
  Building2,
  X,
  Send,
  type LucideIcon,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/foreman/mobile")({
  head: () => ({
    meta: [
      { title: "Напарник мастера · поле — ATAMURA" },
      { name: "description", content: "Полевой интерфейс прораба ATAMURA: факты, заявки, фото, дефекты. Оффлайн-first." },
      { name: "theme-color", content: "#ffffff" },
    ],
  }),
  component: ForemanMobile,
});

// ── Мок-данные ────────────────────────────────────────────────────

type Risk = "ok" | "watch" | "risk";

interface WorkCard {
  id: string;
  title: string;
  section: string;
  brigade: string;
  progress: number; // 0..100
  due: string;
  risk: Risk;
  blocker?: string;
}

const WORKS: WorkCard[] = [
  {
    id: "w1",
    title: "Монолит перекрытия · захватка 4",
    section: "Блок 3 · этаж 7",
    brigade: "БКМ · 12 чел",
    progress: 62,
    due: "до 18:00",
    risk: "risk",
    blocker: "Ждём бетон B25 — заявка 4021",
  },
  {
    id: "w2",
    title: "Кладка перегородок",
    section: "Блок 3 · этаж 5",
    brigade: "Каменщики · 6 чел",
    progress: 84,
    due: "смена",
    risk: "ok",
  },
  {
    id: "w3",
    title: "Штукатурка стен",
    section: "Блок 3 · этаж 4",
    brigade: "Отделка · 8 чел",
    progress: 41,
    due: "до 20:00",
    risk: "watch",
  },
  {
    id: "w4",
    title: "Гидроизоляция балконов",
    section: "Блок 3 · этаж 6",
    brigade: "Кровля · 4 чел",
    progress: 0,
    due: "запуск в 14:00",
    risk: "risk",
    blocker: "Нет мембраны — заявка ожидает",
  },
  {
    id: "w5",
    title: "Электромонтаж · черновая",
    section: "Блок 3 · этаж 2",
    brigade: "Электрики · 5 чел",
    progress: 55,
    due: "смена",
    risk: "ok",
  },
  {
    id: "w6",
    title: "Разгрузка арматуры",
    section: "Склад · площадка",
    brigade: "Грузчики · 4 чел",
    progress: 30,
    due: "до 16:00",
    risk: "watch",
  },
  {
    id: "w7",
    title: "Уборка захватки",
    section: "Блок 3 · этаж 7",
    brigade: "Разнорабочие · 3 чел",
    progress: 10,
    due: "конец смены",
    risk: "ok",
  },
];

type QueueState = "sending" | "queued" | "saved" | "failed";

interface QueueItem {
  id: string;
  kind: "Факт" | "Заявка" | "Фото" | "Дефект";
  title: string;
  createdAt: string;
  state: QueueState;
}

// ── Экран ────────────────────────────────────────────────────────

type Tab = "today" | "add" | "works" | "inbox" | "me";

function ForemanMobile() {
  const { persona } = useRole();
  const { selectedObject } = useWorkspace();
  const [tab, setTab] = useState<Tab>("today");
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([
    { id: "q1", kind: "Факт", title: "Монолит · 25 м³ уложено", createdAt: "10:24", state: "queued" },
    { id: "q2", kind: "Фото", title: "Захватка 4 · после заливки (3 фото)", createdAt: "10:26", state: "sending" },
    { id: "q3", kind: "Дефект", title: "Трещина стяжки · этаж 2, комн. 3", createdAt: "09:12", state: "saved" },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "fact" | "material" | "photo" | "issue">(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const atRisk = useMemo(() => WORKS.filter((w) => w.risk !== "ok").length, []);
  const pendingSync = queue.filter((q) => q.state !== "saved").length;
  const objectShort = selectedObject.short === "Все объекты" ? "ЖК Аура" : selectedObject.short;

  const enqueue = (kind: QueueItem["kind"], title: string) => {
    const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const id = `q${Date.now()}`;
    setQueue((prev) => [
      { id, kind, title, createdAt: now, state: online ? "sending" : "queued" },
      ...prev,
    ]);
    setToast(online ? `Отправляется · ${kind}` : `Сохранено на устройстве · ${kind}`);
    setSheet(null);
    if (online) {
      setTimeout(() => {
        setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, state: "saved" } : q)));
      }, 1600);
    }
  };

  const retry = (id: string) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, state: "sending" } : q)));
    setTimeout(() => {
      setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, state: "saved" } : q)));
    }, 1400);
  };

  const flushAll = () => {
    const ids = queue.filter((q) => q.state !== "saved").map((q) => q.id);
    if (ids.length === 0) return;
    setQueue((prev) =>
      prev.map((q) => (ids.includes(q.id) ? { ...q, state: "sending" } : q)),
    );
    setToast(`Отправляется · ${ids.length}`);
    setTimeout(() => {
      setQueue((prev) =>
        prev.map((q) => (ids.includes(q.id) ? { ...q, state: "saved" } : q)),
      );
      setToast(`Сохранено · ${ids.length}`);
    }, 1600);
  };

  // Полевая тема: светлая с высоким контрастом, вне зависимости от глобальной темы.
  return (
    <div className="field-scope light flex min-h-screen flex-col bg-white text-slate-900">
      {/* Верхний status-bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2 text-[13px]">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 active:scale-[0.97]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            На «Сегодня»
          </Link>
          <div className="flex items-center gap-2">
            <SyncBadge online={online} pending={pendingSync} />
          </div>
        </div>
      </div>

      {/* Контент */}
      <main className="flex-1 pb-[92px]">
        {tab === "today" && (
          <TodayScreen
            persona={persona}
            objectShort={objectShort}
            atRisk={atRisk}
            works={WORKS}
            queue={queue}
            onQuick={(k) => setSheet(k)}
            onRetry={retry}
            onFlushAll={flushAll}
            online={online}
          />
        )}
        {tab === "add" && <AddScreen onPick={(k) => setSheet(k)} />}
        {tab === "works" && <WorksScreen works={WORKS} />}
        {tab === "inbox" && (
          <InboxScreen queue={queue} onRetry={retry} onFlushAll={flushAll} online={online} />
        )}
        {tab === "me" && <MeScreen persona={persona} objectShort={objectShort} />}
      </main>

      {/* Bottom nav */}
      <nav
        aria-label="Основная навигация"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          <BottomTab tab="today" cur={tab} label="Сегодня" icon={Sun} onClick={() => setTab("today")} />
          <BottomTab tab="works" cur={tab} label="Работы" icon={ListChecks} onClick={() => setTab("works")} />
          <BottomAddTab active={tab === "add"} onClick={() => setTab("add")} />
          <BottomTab tab="inbox" cur={tab} label="Входящие" icon={Inbox} onClick={() => setTab("inbox")} badge={pendingSync || undefined} />
          <BottomTab tab="me" cur={tab} label="Я" icon={UserCircle} onClick={() => setTab("me")} />
        </div>
        <div className="h-[env(safe-area-inset-bottom,0)]" />
      </nav>

      {/* Sheet быстрого действия */}
      {sheet && <QuickSheet kind={sheet} onClose={() => setSheet(null)} onSubmit={enqueue} />}

      {/* Тост */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[104px] left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Экраны ────────────────────────────────────────────────────────

function TodayScreen({
  persona,
  objectShort,
  atRisk,
  works,
  queue,
  onQuick,
  onRetry,
  onFlushAll,
  online,
}: {
  persona: { greetingName: string };
  objectShort: string;
  atRisk: number;
  works: WorkCard[];
  queue: QueueItem[];
  onQuick: (k: "fact" | "material" | "photo" | "issue") => void;
  onRetry: (id: string) => void;
  onFlushAll: () => void;
  online: boolean;
}) {
  const shift = new Date().getHours() < 15 ? "утренняя смена" : "вечерняя смена";
  const blockers = works.filter((w) => w.blocker);
  const pending = queue.filter((q) => q.state !== "saved");

  return (
    <div className="space-y-4 px-4 pt-3">
      {/* Шапка контекста — крупно */}
      <header className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <Building2 className="mr-1 inline h-3 w-3" /> Объект · корпус · смена
        </div>
        <div className="mt-1 text-[22px] font-extrabold leading-tight text-slate-900">
          {objectShort} · Блок 3
        </div>
        <div className="mt-0.5 text-sm text-slate-600">
          {persona.greetingName} · {shift}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              План на сегодня
            </div>
            <div className="tnum text-lg font-extrabold text-slate-900">
              {works.length} работ ·{" "}
              <span className={atRisk > 0 ? "text-orange-600" : "text-emerald-600"}>
                {atRisk} под риском
              </span>
            </div>
          </div>
          <div className="tnum grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <span className="text-lg font-black">
              {Math.round(
                works.reduce((a, w) => a + w.progress, 0) / works.length,
              )}
              %
            </span>
          </div>
        </div>
      </header>

      {/* Крупные постоянные кнопки — тач-таргет 56px */}
      <div className="grid grid-cols-2 gap-3">
        <BigAction icon={ClipboardCheck} label="Зафиксировать факт" onClick={() => onQuick("fact")} tone="primary" />
        <BigAction icon={PackagePlus} label="Нужен материал" onClick={() => onQuick("material")} tone="accent" />
        <BigAction icon={Camera} label="Фото" onClick={() => onQuick("photo")} tone="slate" />
        <BigAction icon={AlertOctagon} label="Проблема / дефект" onClick={() => onQuick("issue")} tone="danger" />
      </div>

      {/* Блокеры */}
      {blockers.length > 0 && (
        <section>
          <SectionTitle>Блокеры ({blockers.length})</SectionTitle>
          <ul className="space-y-2">
            {blockers.map((w) => (
              <li
                key={w.id}
                className="rounded-2xl border border-orange-200 bg-orange-50 p-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold text-slate-900">
                      {w.title}
                    </div>
                    <div className="text-[13px] text-slate-700">{w.blocker}</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                      {w.section} · {w.brigade}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Текущие работы (короткий список) */}
      <section>
        <SectionTitle>Текущие работы</SectionTitle>
        <ul className="space-y-2">
          {works.slice(0, 4).map((w) => (
            <WorkTile key={w.id} w={w} />
          ))}
        </ul>
      </section>

      {/* Очередь синхронизации */}
      {pending.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle>Ждут отправки ({pending.length})</SectionTitle>
            <button
              type="button"
              onClick={onFlushAll}
              disabled={!online}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[12px] font-extrabold text-white disabled:opacity-50 active:scale-[0.97]"
            >
              <Send className="h-3.5 w-3.5" />
              Отправить всё
            </button>
          </div>
          <ul className="space-y-2">
            {pending.map((q) => (
              <QueueRow key={q.id} q={q} onRetry={() => onRetry(q.id)} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AddScreen({
  onPick,
}: {
  onPick: (k: "fact" | "material" | "photo" | "issue") => void;
}) {
  return (
    <div className="space-y-3 px-4 pt-4">
      <h2 className="text-lg font-extrabold text-slate-900">Что сделать</h2>
      <div className="space-y-3">
        <BigAction icon={ClipboardCheck} label="Зафиксировать факт" onClick={() => onPick("fact")} tone="primary" wide />
        <BigAction icon={PackagePlus} label="Нужен материал" onClick={() => onPick("material")} tone="accent" wide />
        <BigAction icon={Camera} label="Фото захватки" onClick={() => onPick("photo")} tone="slate" wide />
        <BigAction icon={AlertOctagon} label="Проблема / дефект" onClick={() => onPick("issue")} tone="danger" wide />
      </div>
    </div>
  );
}

function WorksScreen({ works }: { works: WorkCard[] }) {
  return (
    <div className="space-y-3 px-4 pt-4">
      <h2 className="text-lg font-extrabold text-slate-900">Работы смены · {works.length}</h2>
      <ul className="space-y-2">
        {works.map((w) => (
          <WorkTile key={w.id} w={w} />
        ))}
      </ul>
    </div>
  );
}

function InboxScreen({
  queue,
  onRetry,
  onFlushAll,
  online,
}: {
  queue: QueueItem[];
  onRetry: (id: string) => void;
  onFlushAll: () => void;
  online: boolean;
}) {
  const pending = queue.filter((q) => q.state !== "saved");
  const done = queue.filter((q) => q.state === "saved");
  return (
    <div className="space-y-4 px-4 pt-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <SectionTitle>Ждут отправки ({pending.length})</SectionTitle>
          {pending.length > 0 && (
            <button
              type="button"
              onClick={onFlushAll}
              disabled={!online}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[12px] font-extrabold text-white disabled:opacity-50 active:scale-[0.97]"
            >
              <Send className="h-3.5 w-3.5" />
              Отправить всё
            </button>
          )}
        </div>
        {pending.length === 0 ? (
          <EmptyRow>Всё синхронизировано — сеть в норме.</EmptyRow>
        ) : (
          <ul className="space-y-2">
            {pending.map((q) => (
              <QueueRow key={q.id} q={q} onRetry={() => onRetry(q.id)} />
            ))}
          </ul>
        )}
      </div>
      <div>
        <SectionTitle>Сегодня отправлено ({done.length})</SectionTitle>
        <ul className="space-y-2">
          {done.map((q) => (
            <QueueRow key={q.id} q={q} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function MeScreen({
  persona,
  objectShort,
}: {
  persona: { name: string; position: string; greetingName: string };
  objectShort: string;
}) {
  return (
    <div className="space-y-3 px-4 pt-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Смена
        </div>
        <div className="mt-1 text-lg font-extrabold text-slate-900">{persona.name}</div>
        <div className="text-sm text-slate-600">
          {persona.position} · {objectShort}
        </div>
      </div>
      <Link
        to="/foreman"
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 active:scale-[0.99]"
      >
        <span className="text-sm font-bold text-slate-900">Открыть десктоп-версию «Напарника»</span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </Link>
      <Link
        to="/"
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 active:scale-[0.99]"
      >
        <span className="text-sm font-bold text-slate-900">К «Сегодня»</span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </Link>
      <p className="pt-2 text-center text-[11px] text-slate-500">
        Данные условные · демо-режим ATAMURA
      </p>
    </div>
  );
}

// ── Атомы ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </h3>
  );
}

function BigAction({
  icon: Icon,
  label,
  onClick,
  tone,
  wide,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone: "primary" | "accent" | "slate" | "danger";
  wide?: boolean;
}) {
  const toneCls =
    tone === "primary"
      ? "bg-slate-900 text-white ring-slate-900"
      : tone === "accent"
        ? "bg-amber-500 text-white ring-amber-500"
        : tone === "danger"
          ? "bg-red-600 text-white ring-red-600"
          : "bg-white text-slate-900 ring-slate-300";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex ${wide ? "min-h-[72px]" : "min-h-[92px]"} w-full flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 text-center ring-1 shadow-sm active:scale-[0.98] ${toneCls}`}
    >
      <Icon className="h-7 w-7" />
      <span className="text-[14px] font-extrabold leading-tight">{label}</span>
    </button>
  );
}

function WorkTile({ w }: { w: WorkCard }) {
  const riskCls =
    w.risk === "risk"
      ? "border-orange-300 bg-orange-50"
      : w.risk === "watch"
        ? "border-amber-200 bg-amber-50"
        : "border-slate-200 bg-white";
  const dot =
    w.risk === "risk" ? "bg-orange-500" : w.risk === "watch" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <li className={`rounded-2xl border p-3 ${riskCls}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-extrabold leading-tight text-slate-900">
            {w.title}
          </div>
          <div className="text-[12px] text-slate-600">
            {w.section} · {w.brigade}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${w.progress}%` }}
              />
            </div>
            <span className="tnum text-[12px] font-bold text-slate-700">{w.progress}%</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-500">
            <Clock className="h-3 w-3" />
            {w.due}
          </div>
        </div>
      </div>
    </li>
  );
}

function QueueRow({ q, onRetry }: { q: QueueItem; onRetry?: () => void }) {
  const label =
    q.state === "sending"
      ? "Отправляется"
      : q.state === "queued"
        ? "Ждёт связи"
        : q.state === "failed"
          ? "Ошибка · повторить"
          : "Сохранено";
  const icon =
    q.state === "sending" ? (
      <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
    ) : q.state === "queued" ? (
      <WifiOff className="h-4 w-4 text-slate-500" />
    ) : q.state === "failed" ? (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    );
  const tone =
    q.state === "failed"
      ? "border-red-200 bg-red-50"
      : q.state === "saved"
        ? "border-slate-200 bg-white"
        : "border-slate-200 bg-slate-50";
  return (
    <li className={`flex items-center gap-3 rounded-xl border p-3 ${tone}`}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-extrabold text-slate-900">
          {q.kind} · {q.title}
        </div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-slate-500">
          {q.createdAt} · {label}
        </div>
      </div>
      {(q.state === "failed" || q.state === "queued") && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-900 active:scale-[0.97]"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Повторить
        </button>
      )}
    </li>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

function SyncBadge({ online, pending }: { online: boolean; pending: number }) {
  if (!online) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
        <WifiOff className="h-3.5 w-3.5" />
        Нет связи · {pending} ждут
      </span>
    );
  }
  if (pending > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Отправляется · {pending}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white">
      <Wifi className="h-3.5 w-3.5" />
      В сети · всё синхр.
    </span>
  );
}

// ── Bottom nav ────────────────────────────────────────────────────

function BottomTab({
  tab,
  cur,
  label,
  icon: Icon,
  onClick,
  badge,
}: {
  tab: Tab;
  cur: Tab;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: number;
}) {
  const active = cur === tab;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-bold ${
        active ? "text-slate-900" : "text-slate-500"
      } active:bg-slate-50`}
    >
      <Icon className={`h-6 w-6 ${active ? "" : "opacity-80"}`} />
      <span>{label}</span>
      {badge && badge > 0 && (
        <span className="tnum absolute right-3 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
          {badge}
        </span>
      )}
      {active && (
        <span className="absolute inset-x-3 top-0 h-0.5 rounded-b bg-slate-900" aria-hidden />
      )}
    </button>
  );
}

function BottomAddTab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        aria-label="Добавить"
        aria-current={active ? "page" : undefined}
        className="absolute -top-6 grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white active:scale-[0.96]"
      >
        <Plus className="h-7 w-7" />
      </button>
      <span
        className={`mt-8 text-[11px] font-bold ${active ? "text-slate-900" : "text-slate-500"}`}
      >
        Добавить
      </span>
    </div>
  );
}

// ── Quick sheet ───────────────────────────────────────────────────

function QuickSheet({
  kind,
  onClose,
  onSubmit,
}: {
  kind: "fact" | "material" | "photo" | "issue";
  onClose: () => void;
  onSubmit: (kind: QueueItem["kind"], title: string) => void;
}) {
  const cfg: Record<typeof kind, { title: string; kind: QueueItem["kind"]; placeholder: string; icon: LucideIcon; hint: string }> = {
    fact: {
      title: "Зафиксировать факт",
      kind: "Факт",
      placeholder: "Монолит · 25 м³ уложено, захватка 4",
      icon: ClipboardCheck,
      hint: "Что и сколько сделано. Приёмка пойдёт в ПТО.",
    },
    material: {
      title: "Нужен материал",
      kind: "Заявка",
      placeholder: "Мембрана гидроизол · 200 м² · до 14:00",
      icon: PackagePlus,
      hint: "Заявка уйдёт в Снабжение с привязкой к работе.",
    },
    photo: {
      title: "Фото захватки",
      kind: "Фото",
      placeholder: "Комментарий (необязательно)",
      icon: Camera,
      hint: "Камера открывается в один тап · до 10 снимков.",
    },
    issue: {
      title: "Проблема / дефект",
      kind: "Дефект",
      placeholder: "Трещина стяжки · этаж 2, комн. 3",
      icon: AlertOctagon,
      hint: "Пойдёт в реестр дефектов, ПТО и РП увидят сразу.",
    },
  };
  const c = cfg[kind];
  const [text, setText] = useState("");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-4 pb-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" aria-hidden />
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white">
            <c.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold text-slate-900">{c.title}</div>
            <div className="text-[12px] text-slate-500">{c.hint}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-500 active:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {kind === "photo" ? (
          <button
            type="button"
            onClick={() => onSubmit(c.kind, "Фото захватки (3 снимка)")}
            className="mt-4 flex min-h-[72px] w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 text-white active:scale-[0.98]"
          >
            <Camera className="h-7 w-7" />
            <span className="text-base font-extrabold">Открыть камеру</span>
          </button>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={c.placeholder}
            rows={3}
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white p-3 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        )}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-900 active:scale-[0.98]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmit(c.kind, text.trim() || c.placeholder)
            }
            className="flex min-h-[48px] flex-[2] items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white active:scale-[0.98]"
          >
            <CheckCircle2 className="h-5 w-5" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

// Экспорт-заглушка чтобы Home-иконку удалять не пришлось
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unusedHome = Home;
