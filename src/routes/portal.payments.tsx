import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Receipt } from "lucide-react";

export const Route = createFileRoute("/portal/payments")({
  head: () => ({
    meta: [
      { title: "Оплаты — Портал ATAMURA" },
      { name: "description", content: "Заявки на оплату сотрудника: статусы и связь с ATLAS." },
    ],
  }),
  component: PortalPayments,
});

type Status = "approved" | "review" | "paid" | "rejected";

const statusMap: Record<
  Status,
  { label: string; className: string }
> = {
  approved: { label: "Согласована", className: "bg-success/15 text-success" },
  review: { label: "На визе", className: "bg-warning/15 text-warning" },
  paid: { label: "Оплачена", className: "bg-primary/15 text-primary" },
  rejected: { label: "Возврат", className: "bg-destructive/15 text-destructive" },
};

interface Row {
  id: string;
  title: string;
  vendor: string;
  object: string;
  amount: string;
  status: Status;
  atlas?: { to: string; params?: Record<string, string> };
  date: string;
}

const rows: Row[] = [
  {
    id: "АВР-015",
    title: "Работы по фасаду · АВР-015",
    vendor: "АлюмФасад",
    object: "ЖК Аура",
    amount: "12,8 млн ₸",
    status: "review",
    atlas: { to: "/finance", params: { from: "portal", act: "АВР-015", object: "aura" } },
    date: "12 июля",
  },
  {
    id: "КС-2-047",
    title: "Монолит блок 2 · КС-2 №047",
    vendor: "Монолит-KZ",
    object: "ЖК Атмосфера",
    amount: "48,4 млн ₸",
    status: "rejected",
    atlas: { to: "/finance", params: { from: "portal", act: "КС-2-047", object: "atmosfera" } },
    date: "11 июля",
  },
  {
    id: "КС-3-012",
    title: "Электромонтаж · КС-3 №012",
    vendor: "ЭлектроСтрой",
    object: "ЖК Керуен",
    amount: "22,1 млн ₸",
    status: "approved",
    atlas: { to: "/finance", params: { from: "portal", act: "КС-3-012", object: "keruen" } },
    date: "10 июля",
  },
  {
    id: "AVR-009",
    title: "Дополнительные работы · АВР-009",
    vendor: "АлюмФасад",
    object: "ЖК Аура",
    amount: "3,4 млн ₸",
    status: "paid",
    date: "5 июля",
  },
  {
    id: "SUP-234",
    title: "Возмещение командировки",
    vendor: "Т. Бекеев",
    object: "—",
    amount: "142 400 ₸",
    status: "paid",
    date: "3 июля",
  },
];

function PortalPayments() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-semibold text-accent-foreground/70">Портал ATAMURA · Работа</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <Receipt className="h-8 w-8 text-accent-foreground/70" /> Оплаты
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Реестр заявок на оплату. Строки с актами ведут в ATLAS · Финансы и акты.
        </p>
      </header>

      <div className="card-soft overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3">Заявка</th>
              <th className="px-4 py-3">Подрядчик</th>
              <th className="px-4 py-3">Объект</th>
              <th className="px-4 py-3 text-right">Сумма</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const st = statusMap[r.status];
              return (
                <tr
                  key={r.id}
                  className={`transition-colors hover:bg-muted/40 ${
                    i < rows.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold tracking-tight">{r.title}</div>
                    <div className="tnum text-[11px] text-muted-foreground">
                      №{r.id} · {r.date}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-sm">{r.vendor}</td>
                  <td className="px-4 py-3 align-top text-sm text-muted-foreground">
                    {r.object}
                  </td>
                  <td className="tnum px-4 py-3 text-right align-top font-bold">
                    {r.amount}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${st.className}`}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    {r.atlas ? (
                      <Link
                        to={r.atlas.to}
                        search={r.atlas.params}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      >
                        В ATLAS <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
