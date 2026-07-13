import { createFileRoute } from "@tanstack/react-router";
import { Clock, Newspaper } from "lucide-react";

export const Route = createFileRoute("/portal/news")({
  head: () => ({
    meta: [
      { title: "Новости — Портал ATAMURA" },
      { name: "description", content: "Внутренний журнал компании ATAMURA." },
    ],
  }),
  component: PortalNews,
});

const posts = [
  {
    id: 1,
    tag: "Компания",
    title: "ATAMURA сдала ЖК «Керуен» на месяц раньше графика",
    excerpt:
      "Команда РП, снабжения и ПТО закрыла квартал с рекордной скоростью — 780 квартир переданы дольщикам.",
    when: "2 часа назад",
    author: "Пресс-служба",
  },
  {
    id: 2,
    tag: "HR",
    title: "Открыт набор в программу лидеров стройки — 12 мест",
    excerpt:
      "Полугодовая программа для прорабов и инженеров ПТО. Заявки принимаются до 30 июля.",
    when: "вчера",
    author: "Академия ATAMURA",
  },
  {
    id: 3,
    tag: "Стройка",
    title: "Новая методика приёмки монолита — с 1 августа",
    excerpt:
      "ПТО обновляет чек-листы Рэмбо, теперь с фотофиксацией арматуры и обязательным аудитом СБ.",
    when: "3 дня назад",
    author: "Дирекция стройки",
  },
  {
    id: 4,
    tag: "Финансы",
    title: "Итоги полугодия: экономия на закупках 640 млн ₸",
    excerpt:
      "Cockpit финконтроля поймал 42 завышения по актам. Спасибо команде Мадины Жумабай и Айгуль Тлеу.",
    when: "неделю назад",
    author: "Финдирекция",
  },
];

function PortalNews() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-sm font-semibold text-accent-foreground/70">Портал ATAMURA · Компания</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <Newspaper className="h-8 w-8 text-accent-foreground/70" /> Новости
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Внутренний журнал компании. Демо-контент.
        </p>
      </header>

      <ul className="space-y-4">
        {posts.map((p) => (
          <li
            key={p.id}
            className="card-soft flex flex-col gap-3 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]">
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-accent-foreground">
                {p.tag}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {p.when}
              </span>
              <span className="text-muted-foreground/60">· {p.author}</span>
            </div>
            <h2 className="text-xl font-extrabold leading-tight tracking-tight">
              {p.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
