import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";

export type Space = "today" | "company" | "atlas";

export interface AtlasObject {
  id: string;
  name: string;
  short: string;
}

export const OBJECTS: AtlasObject[] = [
  { id: "all", name: "Все объекты", short: "Все объекты" },
  { id: "aura", name: "ЖК Аура", short: "Аура" },
  { id: "atmosfera", name: "ЖК Атмосфера", short: "Атмосфера" },
  { id: "keruen", name: "ЖК Керуен", short: "Керуен" },
  { id: "aksay", name: "ЖК Аксай", short: "Аксай" },
];

const STORAGE_KEY = "atlas.selectedObject";

interface WorkspaceCtx {
  space: Space;
  objects: AtlasObject[];
  selectedObject: AtlasObject;
  setObjectId: (id: string) => void;
}

const Ctx = createContext<WorkspaceCtx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const space: Space =
    pathname === "/"
      ? "today"
      : pathname.startsWith("/portal")
        ? "company"
        : "atlas";

  const [objectId, setObjectIdState] = useState<string>("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && OBJECTS.some((o) => o.id === saved)) setObjectIdState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setObjectId = (id: string) => {
    setObjectIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<WorkspaceCtx>(() => {
    const selectedObject =
      OBJECTS.find((o) => o.id === objectId) ?? OBJECTS[0];
    return { space, objects: OBJECTS, selectedObject, setObjectId };
  }, [space, objectId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace(): WorkspaceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
