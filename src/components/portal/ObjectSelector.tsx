import { Check, ChevronDown, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/lib/workspace";

/**
 * Ось объекта ATLAS: селектор в шапке ATLAS-пространства.
 * Выбор сохраняется в localStorage и виден в крошках, действует между модулями.
 */
export function ObjectSelector() {
  const { objects, selectedObject, setObjectId } = useWorkspace();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Ось объекта: ${selectedObject.name}. Выбор действует между модулями ATLAS.`}
        title="Ось объекта — сохраняется между модулями"
        className="group flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-left text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MapPin className="h-3.5 w-3.5 text-accent-foreground/70" />
        <span className="max-w-[120px] truncate">{selectedObject.short}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Ось объекта · ATLAS
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {objects.map((o) => {
          const active = o.id === selectedObject.id;
          return (
            <DropdownMenuItem
              key={o.id}
              onSelect={() => setObjectId(o.id)}
              className="flex items-center gap-2"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{o.name}</span>
              {active && <Check className="h-4 w-4 text-success" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] leading-snug text-muted-foreground">
          Выбор объекта сохраняется при переходах между модулями ATLAS.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
