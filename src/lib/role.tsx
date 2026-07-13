import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role =
  | "admin"
  | "owner"
  | "construction_dir"
  | "pm"
  | "foreman"
  | "supply"
  | "pto"
  | "finance"
  | "office";

export interface Persona {
  id: Role;
  name: string;
  position: string;
  initials: string;
  workspaceTitle: string;
  greetingName: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "admin",
    name: "Администратор ATLAS",
    position: "Администратор · Все модули",
    initials: "АА",
    workspaceTitle: "Полный доступ · Администратор ATLAS",
    greetingName: "Администратор",
  },
  {
    id: "owner",
    name: "Данияр Атамура",
    position: "Собственник",
    initials: "ДА",
    workspaceTitle: "Рабочее пространство собственника",
    greetingName: "Данияр",
  },
  {
    id: "construction_dir",
    name: "Асхат Сериков",
    position: "Директор по стройке",
    initials: "АС",
    workspaceTitle: "Рабочее пространство директора по стройке",
    greetingName: "Асхат",
  },
  {
    id: "pm",
    name: "Ержан Касымов",
    position: "Руководитель проекта",
    initials: "ЕК",
    workspaceTitle: "Рабочее пространство РП",
    greetingName: "Ержан",
  },
  {
    id: "foreman",
    name: "Тимур Бекеев",
    position: "Мастер · прораб",
    initials: "ТБ",
    workspaceTitle: "Мобильный напарник мастера",
    greetingName: "Тимур",
  },
  {
    id: "supply",
    name: "Динара Мукаш",
    position: "Руководитель снабжения",
    initials: "ДМ",
    workspaceTitle: "Рабочее пространство снабжения",
    greetingName: "Динара",
  },
  {
    id: "pto",
    name: "Айгуль Тлеу",
    position: "Инженер ПТО",
    initials: "АТ",
    workspaceTitle: "Рабочее пространство ПТО",
    greetingName: "Айгуль",
  },
  {
    id: "finance",
    name: "Мадина Жумабай",
    position: "Финансовый директор",
    initials: "МЖ",
    workspaceTitle: "Рабочее пространство финдиректора",
    greetingName: "Мадина",
  },
  {
    id: "office",
    name: "Алия Нурланова",
    position: "Офисный сотрудник",
    initials: "АН",
    workspaceTitle: "Рабочее пространство сотрудника",
    greetingName: "Алия",
  },
];

// Список доступных модулей по ролям. Порядок = приоритет отображения.
export const ROLE_ACCESS: Record<Role, string[]> = {
  admin: [
    "/",
    "/command",
    "/portfolio",
    "/rp",
    "/gpr",
    "/league",
    "/object",
    "/foreman",
    "/supply",
    "/pto",
    "/finance",
  ],
  owner: ["/", "/command", "/portfolio", "/finance"],
  construction_dir: ["/", "/command", "/gpr", "/league", "/rp", "/object", "/pto", "/supply"],
  pm: ["/", "/rp", "/gpr", "/object", "/league"],
  foreman: ["/", "/foreman", "/object"],
  supply: ["/", "/supply"],
  pto: ["/", "/pto", "/gpr"],
  finance: ["/", "/finance", "/command", "/portfolio"],
  office: ["/"],
};

export function canAccess(role: Role, path: string): boolean {
  return ROLE_ACCESS[role].includes(path);
}

interface RoleContextValue {
  role: Role;
  persona: Persona;
  setRole: (r: Role) => void;
  personas: Persona[];
  allowed: string[];
  canAccess: (path: string) => boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);
const STORAGE_KEY = "atlas.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Role | null;
      if (saved && PERSONAS.some((p) => p.id === saved)) setRoleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem(STORAGE_KEY, r);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<RoleContextValue>(() => {
    const persona = PERSONAS.find((p) => p.id === role) ?? PERSONAS[0];
    const allowed = ROLE_ACCESS[role];
    return {
      role,
      persona,
      setRole,
      personas: PERSONAS,
      allowed,
      canAccess: (path: string) => allowed.includes(path),
    };
  }, [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
