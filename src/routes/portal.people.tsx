import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Users } from "lucide-react";

export const Route = createFileRoute("/portal/people")({
  head: () => ({
    meta: [
      { title: "Люди — Портал ATAMURA" },
      { name: "description", content: "Сотрудники ATAMURA — контакты и подразделения." },
    ],
  }),
  component: PortalPeople,
});

const people = [
  { name: "Данияр Атамура", position: "Собственник", dept: "Дирекция", city: "Алматы", init: "ДА" },
  { name: "Асхат Сериков", position: "Директор по стройке", dept: "Стройка", city: "Астана", init: "АС" },
  { name: "Мадина Жумабай", position: "Финансовый директор", dept: "Финансы", city: "Алматы", init: "МЖ" },
  { name: "Ержан Касымов", position: "Руководитель проекта", dept: "Стройка · ЖК Аура", city: "Алматы", init: "ЕК" },
  { name: "Динара Мукаш", position: "Руководитель снабжения", dept: "Снабжение", city: "Астана", init: "ДМ" },
  { name: "Айгуль Тлеу", position: "Инженер ПТО", dept: "ПТО", city: "Алматы", init: "АТ" },
  { name: "Тимур Бекеев", position: "Мастер · прораб", dept: "Стройка · ЖК Атмосфера", city: "Алматы", init: "ТБ" },
  { name: "Салтанат Куат", position: "HR-директор", dept: "HR", city: "Астана", init: "СК" },
];

function PortalPeople() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-sm font-semibold text-accent-foreground/70">Портал ATAMURA · Компания</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <Users className="h-8 w-8 text-accent-foreground/70" /> Люди
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Сотрудники, подразделения и контакты. Демо-справочник.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <li
            key={p.name}
            className="card-soft flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-accent-foreground">
                {p.init}
              </div>
              <div className="min-w-0">
                <div className="truncate font-extrabold">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">{p.position}</div>
              </div>
            </div>
            <div className="mt-1 space-y-1 text-[12px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {p.dept} · {p.city}
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />{" "}
                {p.name.split(" ")[0].toLowerCase()}@atamura.group
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> +7 700 000 00 00 {/* демо-плейсхолдер, не реальный номер · pii-ok */}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
