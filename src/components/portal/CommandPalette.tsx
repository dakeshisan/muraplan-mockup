import { useEffect, useState, createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  UserCog,
  Palette,
  Home,
  Terminal,
  AtSign,
  Hash,
  DollarSign,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { navGroups } from "./nav";
import { allPortalItems } from "./portal-space-nav";
import { useRole } from "@/lib/role";
import { useTheme } from "@/lib/theme";
import { useWorkspace } from "@/lib/workspace";

interface CommandPaletteCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const Ctx = createContext<CommandPaletteCtx | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  const value = useMemo<CommandPaletteCtx>(
    () => ({ open, setOpen, toggle: () => setOpen((v) => !v) }),
    [open],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CommandPalette query={query} setQuery={setQuery} />
    </Ctx.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  return ctx;
}

// ── Мок-данные для командной шины ────────────────────────────────

const PEOPLE = [
  { id: "kasymov", name: "Ержан Касымов", role: "РП · ЖК Аура", to: "/rp" },
  { id: "dinara", name: "Динара Мукатова", role: "Снабжение", to: "/supply" },
  { id: "madina", name: "Мадина Жумабай", role: "Финдир", to: "/finance" },
  { id: "timur", name: "Тимур Ахметов", role: "Прораб · Аура", to: "/foreman" },
  { id: "aigul", name: "Айгуль Тлеу", role: "ПТО", to: "/pto" },
  { id: "aldiyar", name: "Алдияр Жумагулов", role: "Дир. по стройке", to: "/command" },
];

const ENTITIES = [
  { id: "act-142", label: "Акт КС-2 №142", kind: "Акт", obj: "Аура", to: "/finance" },
  { id: "act-138", label: "Акт КС-2 №138", kind: "Акт", obj: "Аура", to: "/finance" },
  { id: "req-4021", label: "Заявка №4021 · бетон B25", kind: "Заявка", obj: "Аура", to: "/supply" },
  { id: "req-4033", label: "Заявка №4033 · арматура", kind: "Заявка", obj: "Атмосфера", to: "/supply" },
  { id: "pay-882", label: "Платёж №882 · БКМ-Строй", kind: "Платёж", obj: "Аура", to: "/finance" },
  { id: "task-b3", label: "Монолит Блок 3 · захватка 4", kind: "ГПР", obj: "Аура", to: "/gpr" },
];

const QUICK_QUERIES = [
  { q: "мои просроченные", label: "Мои просроченные дела", to: "/" as const, icon: Zap },
  { q: "согласовать акт", label: "Акты на согласование", to: "/finance" as const, icon: Zap },
  { q: "заявки без даты", label: "Заявки без даты поставки", to: "/supply" as const, icon: Zap },
];

function CommandPalette({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const { canAccess, personas, setRole, role } = useRole();
  const { theme, toggle: toggleTheme } = useTheme();
  const { objects, setObjectId, space } = useWorkspace();

  // Разбор префикса команды: >, @, #, $
  const prefix = query.trim().charAt(0);
  const term = query.trim().slice(1).trim().toLowerCase();
  const raw = query.trim().toLowerCase();
  const isCmd = prefix === ">";
  const isPeople = prefix === "@";
  const isObj = prefix === "#";
  const isEntity = prefix === "$";
  const filterMode = isCmd || isPeople || isObj || isEntity;

  // Все ATLAS-модули как «команды» (>), с учётом роли.
  const atlasItems = navGroups
    .flatMap((g) => g.items)
    .filter((i) => canAccess(i.url))
    .map((i) => ({ ...i, source: "ATLAS" as const }));
  const portalItems = allPortalItems
    .filter((i) => !!i.url && !i.soon)
    .map((i) => ({
      title: i.title,
      desc: i.desc,
      url: i.url as string,
      icon: i.icon,
      source: "Портал" as const,
    }));

  const match = (hay: string) => !term || hay.toLowerCase().includes(term);
  const matchRaw = (hay: string) => !raw || hay.toLowerCase().includes(raw);

  const cmdResults = (isCmd || !filterMode
    ? [...atlasItems, ...portalItems]
    : []
  ).filter((i) => (isCmd ? match(`${i.title} ${i.desc}`) : matchRaw(`${i.title} ${i.desc}`)));
  // Сначала — то, что в текущем пространстве.
  cmdResults.sort((a, b) => {
    const aHere = (space === "atlas" ? a.source === "ATLAS" : a.source === "Портал") ? 0 : 1;
    const bHere = (space === "atlas" ? b.source === "ATLAS" : b.source === "Портал") ? 0 : 1;
    return aHere - bHere;
  });

  const peopleResults = (isPeople || !filterMode ? PEOPLE : []).filter((p) =>
    isPeople ? match(p.name + " " + p.role) : matchRaw(p.name),
  );
  const objectResults = (isObj || !filterMode ? objects.filter((o) => o.id !== "all") : []).filter(
    (o) => (isObj ? match(o.name) : matchRaw(o.name)),
  );
  const entityResults = (isEntity || !filterMode ? ENTITIES : []).filter((e) =>
    isEntity ? match(e.label + " " + e.kind) : matchRaw(e.label),
  );
  const quickResults = filterMode
    ? []
    : QUICK_QUERIES.filter((q) => matchRaw(q.label + " " + q.q));

  const go = (url: string, title: string) => {
    setOpen(false);
    navigate({ to: url });
    toast(`Открыт модуль «${title}»`, { duration: 1400 });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <VisuallyHidden>
        <DialogTitle>Командная палитра ATLAS</DialogTitle>
        <DialogDescription>
          Командная шина: {'>'}команды · @люди · #объекты · $сущности.
        </DialogDescription>
      </VisuallyHidden>
      <CommandInput
        placeholder="Начните с > @ # $ · «мои просроченные», «согласовать акт 142»…"
        value={query}
        onValueChange={setQuery}
      />
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <PrefixHint char=">" label="команды" icon={Terminal} active={isCmd} />
        <PrefixHint char="@" label="люди" icon={AtSign} active={isPeople} />
        <PrefixHint char="#" label="объекты" icon={Hash} active={isObj} />
        <PrefixHint char="$" label="сущности" icon={DollarSign} active={isEntity} />
        <span className="ml-auto normal-case tracking-normal text-[10px] text-muted-foreground/70">
          {space === "atlas" ? "в ATLAS сначала" : space === "company" ? "в Портале сначала" : "везде"}
        </span>
      </div>
      <CommandList>
        <CommandEmpty>
          Ничего не найдено. Попробуйте {'>'}модуль, @имя, #объект или $заявка.
        </CommandEmpty>

        {quickResults.length > 0 && (
          <CommandGroup heading="Быстрые запросы">
            {quickResults.map((q) => (
              <CommandItem
                key={q.q}
                value={`quick ${q.q} ${q.label}`}
                onSelect={() => go(q.to, q.label)}
              >
                <q.icon className="mr-2 h-4 w-4 shrink-0 text-accent-foreground" />
                <span className="font-semibold">{q.label}</span>
                <CommandShortcut>{q.to}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {cmdResults.length > 0 && (
          <CommandGroup heading={isCmd ? "Команды" : "Модули"}>
            {cmdResults.map((item) => (
              <CommandItem
                key={`${item.source}-${item.url}`}
                value={`${item.title} ${item.desc} ${item.url}`}
                onSelect={() => go(item.url, item.title)}
              >
                <item.icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-semibold">{item.title}</span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {item.source} · {item.desc}
                  </span>
                </div>
                <CommandShortcut className="tnum">{item.url}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {peopleResults.length > 0 && (
          <CommandGroup heading="Люди · @">
            {peopleResults.map((p) => (
              <CommandItem
                key={p.id}
                value={`@${p.name} ${p.role}`}
                onSelect={() => go(p.to, p.name)}
              >
                <AtSign className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    ATLAS · {p.role}
                  </span>
                </div>
                <CommandShortcut>{p.to}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {objectResults.length > 0 && (
          <CommandGroup heading="Объекты · #">
            {objectResults.map((o) => (
              <CommandItem
                key={o.id}
                value={`#${o.name}`}
                onSelect={() => {
                  setObjectId(o.id);
                  setOpen(false);
                  toast(`Скоуп: ${o.name}`, { description: "Реестры ATLAS фильтруются по объекту", duration: 1400 });
                }}
              >
                <Hash className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-semibold">{o.name}</span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    ATLAS · переключить ось объекта
                  </span>
                </div>
                <CommandShortcut>скоуп</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {entityResults.length > 0 && (
          <CommandGroup heading="Сущности · $">
            {entityResults.map((e) => (
              <CommandItem
                key={e.id}
                value={`$${e.label} ${e.kind}`}
                onSelect={() => go(e.to, e.label)}
              >
                <ArrowRight className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-semibold">{e.label}</span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    ATLAS · {e.obj} · {e.kind}
                  </span>
                </div>
                <CommandShortcut>{e.to}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading="Роль">
          {personas.map((p) => (
            <CommandItem
              key={p.id}
              value={`role ${p.name} ${p.position}`}
              onSelect={() => {
                setRole(p.id);
                setOpen(false);
                toast.success(`Вошли как ${p.name}`, {
                  description: p.position,
                  duration: 1800,
                });
              }}
            >
              <UserCog className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-semibold">{p.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">{p.position}</span>
              </div>
              {p.id === role && (
                <CommandShortcut className="text-success">активна</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Действия">
          <CommandItem
            value="theme toggle тема"
            onSelect={() => {
              toggleTheme();
              setOpen(false);
              toast(`Тема: ${theme === "dark" ? "светлая" : "тёмная"}`, { duration: 1400 });
            }}
          >
            <Palette className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-semibold">Переключить тему</span>
            <CommandShortcut>{theme === "dark" ? "→ светлая" : "→ тёмная"}</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="home сегодня главная"
            onSelect={() => go("/", "Сегодня")}
          >
            <Home className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-semibold">К «Сегодня»</span>
            <CommandShortcut>/</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function PrefixHint({
  char,
  label,
  icon: Icon,
  active,
}: {
  char: string;
  label: string;
  icon: typeof Terminal;
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-3 w-3" />
      <span className="tnum font-bold">{char}</span>
      <span className="normal-case tracking-normal">{label}</span>
    </span>
  );
}
