import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileText, ShieldCheck } from "lucide-react";
import { getPilotFinanceCases } from "@/finance.functions";
import type { FinanceCase } from "@/server/pilot-db.server";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Финансы и акты · ATLAS" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  loader: () => getPilotFinanceCases(),
  component: FinancePilotPage,
});

const readinessMeta = {
  blocked: {
    label: "Не готов",
    className: "bg-destructive/10 text-destructive",
    icon: AlertTriangle,
  },
  review: {
    label: "Нужно решение человека",
    className: "bg-warning/15 text-warning",
    icon: Clock3,
  },
  ready: {
    label: "Готов к финальному решению",
    className: "bg-success/15 text-success",
    icon: CheckCircle2,
  },
} as const;

const roleLabels = {
  owner: "Собственник",
  finance: "Финансы",
  construction_director: "Директор по строительству",
  pto: "ПТО",
  observer: "Наблюдатель",
} as const;

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null): string {
  if (!value) return "Не указана";
  return new Intl.DateTimeFormat("ru-KZ", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

function FinancePilotPage() {
  const data = Route.useLoaderData();
  const [selectedId, setSelectedId] = useState<string | null>(data.cases[0]?.caseId ?? null);
  const selectedCase = useMemo(
    () => data.cases.find((item) => item.caseId === selectedId) ?? data.cases[0] ?? null,
    [data.cases, selectedId],
  );

  return (
    <main className="min-h-screen bg-[#f6f8fa] text-[#233c52]">
      <header className="border-b border-[#dfe7ec] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d6b78]">
              ATLAS · закрытый пилот
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Финансы и акты · ЖК «Аура»
            </h1>
            <p className="mt-1 text-sm text-[#5f7484]">
              Контроль готовности платежа. Финальное решение остаётся в Telegram.
            </p>
          </div>
          <div className="rounded-xl border border-[#dfe7ec] bg-[#f6f8fa] px-4 py-2 text-right text-xs">
            <div className="font-bold text-[#183a52]">{data.identity.displayName}</div>
            <div className="mt-0.5 text-[#5f7484]">{roleLabels[data.identity.role]}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-5 py-6 sm:px-8">
        <section className="flex gap-3 rounded-xl border border-[#b8dce2] bg-[#eaf7f8] px-4 py-3 text-sm text-[#0d6b78]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Источники: Bitrix и Шерлок — только чтение; 1С — ежедневная безопасная выгрузка.
            Оригиналы документов остаются в Bitrix.
          </p>
        </section>

        {data.sourceStatus !== "ready" ? (
          <section className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-4 text-sm text-warning">
            {data.sourceStatus === "not_configured"
              ? "Контур данных ещё не подключён. Доступ к финансовым данным намеренно не открыт."
              : "Источник временно недоступен. Не принимайте решение по данным этого экрана."}
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-[#dfe7ec] bg-white shadow-sm">
          <div className="border-b border-[#e6edf1] px-5 py-4">
            <h2 className="font-bold">Реестр заявок</h2>
            <p className="mt-0.5 text-xs text-[#5f7484]">
              Только Аура · {data.cases.length} в защищённой витрине
            </p>
          </div>
          {data.cases.length === 0 ? (
            <div className="px-5 py-10 text-sm text-[#5f7484]">
              После первого подписанного импорта здесь появятся заявки Ауры.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="bg-[#f8fafb] text-left text-[11px] uppercase tracking-[0.08em] text-[#5f7484]">
                  <tr>
                    <th className="px-5 py-3">Акт</th>
                    <th className="px-4 py-3">Подрядчик</th>
                    <th className="px-4 py-3 text-right">Сумма</th>
                    <th className="px-4 py-3">Шерлок</th>
                    <th className="px-4 py-3">1С</th>
                    <th className="px-4 py-3">Итог</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.cases.map((item) => {
                    const meta = readinessMeta[item.readiness];
                    const Icon = meta.icon;
                    return (
                      <tr
                        key={item.caseId}
                        className="border-t border-[#edf1f3] hover:bg-[#f8fbfc]"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold">
                            {item.actType} · {item.actNumber}
                          </div>
                          <div className="mt-0.5 text-xs text-[#5f7484]">Bitrix #{item.caseId}</div>
                        </td>
                        <td className="px-4 py-4">{item.contractor}</td>
                        <td className="px-4 py-4 text-right font-bold tabular-nums">
                          {formatMoney(item.amountTenge)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold capitalize">{item.severity}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-[#5f7484]">
                          {item.oneCCheckedAt
                            ? formatDate(item.oneCCheckedAt)
                            : "Нет свежей выгрузки"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.caseId)}
                            className="rounded-lg border border-[#cbd8de] px-3 py-1.5 text-xs font-bold text-[#183a52] hover:border-[#1aa5b8]"
                          >
                            Подробнее
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedCase ? <CaseCard item={selectedCase} /> : null}
      </div>
    </main>
  );
}

function CaseCard({ item }: { item: FinanceCase }) {
  const meta = readinessMeta[item.readiness];
  const Icon = meta.icon;
  return (
    <section className="rounded-2xl border border-[#dfe7ec] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0d6b78]">
            Карточка проверки
          </p>
          <h2 className="mt-1 text-xl font-extrabold">
            {item.actType} · {item.actNumber}
          </h2>
          <p className="mt-1 text-sm text-[#5f7484]">
            {item.contractor} · {formatMoney(item.amountTenge)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}
        >
          <Icon className="h-4 w-4" />
          {meta.label}
        </span>
      </div>
      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Этап Bitrix" value={item.bitrixStage} />
        <Info label="Проверка Шерлока" value={`${item.severity} · ${formatDate(item.checkedAt)}`} />
        <Info
          label="Сверка 1С"
          value={
            item.oneCCheckedAt
              ? `${item.oneCStatus ?? "unknown"} · ${formatDate(item.oneCCheckedAt)}`
              : "Нет свежей выгрузки"
          }
        />
        <Info
          label="Документы"
          value={`${item.documentCount} · ${item.documentTypes.join(", ") || "типы не указаны"}`}
          icon={<FileText className="h-4 w-4" />}
        />
      </div>
      {item.findings.length > 0 ? (
        <div className="mt-5 rounded-xl bg-[#f8fafb] p-4">
          <h3 className="text-sm font-bold">Причины проверки</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-[#5f7484]">
            {item.findings.map((finding) => (
              <li key={`${finding.ruleId}-${finding.detail}`}>• {finding.detail}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-5 rounded-xl border border-[#dfe7ec] bg-[#f6f8fa] px-4 py-3 text-sm text-[#5f7484]">
        Следующий шаг: финальное решение принимается в действующей карточке Telegram. ATLAS не
        изменяет её статус и не проводит платёж.
      </p>
    </section>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5f7484]">
        {label}
      </div>
      <div className="mt-1 flex items-start gap-1.5 font-semibold text-[#233c52]">
        {icon}
        {value}
      </div>
    </div>
  );
}
