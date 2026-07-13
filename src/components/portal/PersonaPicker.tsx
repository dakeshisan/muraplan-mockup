import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Package, Gauge, HardHat, Wallet, HardHat as HardHatIcon, Compass, Briefcase, UserCircle } from "lucide-react";
import { PERSONAS, useRole, type Role } from "@/lib/role";
import { useNavigate, useRouterState } from "@tanstack/react-router";

const STORAGE_KEY = "atlas.personaChosen";

/** Персоны, доступные в стартовом выборе (без «Администратора» и «Собственника»). */
const CHOOSABLE: Role[] = [
  "supply",
  "pm",
  "foreman",
  "finance",
  "construction_dir",
  "office",
];

const ICONS: Partial<Record<Role, typeof Package>> = {
  supply: Package,
  pm: Gauge,
  foreman: HardHat,
  finance: Wallet,
  construction_dir: Compass,
  office: UserCircle,
  owner: Briefcase,
  admin: HardHatIcon,
  pto: HardHatIcon,
};

const HINTS: Partial<Record<Role, string>> = {
  supply: "Заявки, поставки, цены",
  pm: "Пульт РП: объекты, ГПР, бригады",
  foreman: "Мобильный напарник на объекте",
  finance: "Платежи, акты, кассовый разрыв",
  construction_dir: "Портфель стройки, отклонения",
  office: "Портал сотрудника: новости, оплаты",
};

interface Ctx {
  open: boolean;
  openPicker: () => void;
}

const PickerCtx = createContext<Ctx | null>(null);

export function PersonaPickerProvider({ children }: { children: ReactNode }) {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (pathname === "/login") return;
    try {
      const chosen = localStorage.getItem(STORAGE_KEY);
      if (!chosen) setOpen(true);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  const ctx = useMemo<Ctx>(
    () => ({
      open,
      openPicker: () => setOpen(true),
    }),
    [open],
  );

  const handleChoose = (r: Role) => {
    setRole(r);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    // Прораб на узком экране — сразу в полевой интерфейс.
    if (r === "foreman") {
      const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
      if (narrow) navigate({ to: "/foreman/mobile" });
    }
  };

  return (
    <PickerCtx.Provider value={ctx}>
      {children}
      {open && <PersonaPickerOverlay onChoose={handleChoose} />}
    </PickerCtx.Provider>
  );
}

export function usePersonaPicker() {
  const ctx = useContext(PickerCtx);
  if (!ctx) throw new Error("usePersonaPicker must be inside PersonaPickerProvider");
  return ctx;
}

function PersonaPickerOverlay({ onChoose }: { onChoose: (r: Role) => void }) {
  const personas = CHOOSABLE.map((id) => PERSONAS.find((p) => p.id === id)!).filter(Boolean);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Выбор персоны"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm animate-page-in"
    >
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-foreground/70">
            ATAMURA · демо-режим
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Кто вы сегодня?
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Выбор персоны задаёт роль, доступные модули и формат «дома».
            Сменить можно в меню профиля.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((p) => {
            const Icon = ICONS[p.id] ?? UserCircle;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChoose(p.id)}
                className="card-soft group flex flex-col items-start gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex w-full items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-foreground">
                      {p.position}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{p.name}</div>
                  </div>
                </div>
                {HINTS[p.id] && (
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    {HINTS[p.id]}
                  </p>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Данные условные · переключение сохраняется локально в браузере.
        </p>
      </div>
    </div>
  );
}
