import { findNavItem } from "./nav";
import { Hammer } from "lucide-react";

export function ComingSoon({ url }: { url: string }) {
  const item = findNavItem(url);
  if (!item) return null;
  const Icon = item.icon;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{item.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
      </div>
      <div className="card-soft flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft">
          <Icon className="h-8 w-8 text-accent-foreground/70" />
        </div>
        <div>
          <div className="text-lg font-extrabold">Скоро</div>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Экран «{item.title}» в разработке — он появится в одном из следующих обновлений портала.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          <Hammer className="h-3 w-3" /> Строим для вас
        </div>
      </div>
    </div>
  );
}
