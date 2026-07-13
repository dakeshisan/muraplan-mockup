import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileSignature,
  Flame,
  History,
  MoreHorizontal,
  PackageSearch,
  ShieldAlert,
  Timer,
  TrendingDown,
  Wallet,
  X,
  Activity,
  Bell,
  Building2,
  ClipboardList,
  Coins,
  HardHat,
  LineChart,
  Map as MapIcon,
  Megaphone,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useRole, type Role } from "@/lib/role";
import { useWorkspace } from "@/lib/workspace";
import { toast } from "sonner";
import { EmptyVictory } from "@/components/portal/SourceStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: TodayPage,
});

// ─────────────────────────────────────────────────────────────
// Модель «Моей работы»
// Приоритет прозрачный: безопасность/остановка → срок → блокировка других
// → деньги → сегодня. Красный — только для реально критичного.
// ─────────────────────────────────────────────────────────────

type WorkState = "todo" | "waiting" | "watching" | "done";
type Bucket = "blocks" | "overdue" | "today" | "next";

interface WorkItem {
  id: string;
  state: WorkState;
  bucket?: Bucket;
  verb: string; // «Согласовать заявку на бетон»
  context: string; // объект + процесс, короткая строка
  object?: string;
  due: string; // человекочитаемый срок/SLA
  amount?: string; // сумма или влияние
  reason: string; // почему приоритет: «блокирует заливку 14.07»
  source: string; // «из /supply» / «из акта КС-2 №142»
  primary: { label: string; to: string; search?: Record<string, string> };
  category:
    | "Заявки"
    | "Акты"
    | "ГПР"
    | "Риски"
    | "ПТО"
    | "Финансы"
    | "Задачи"
    | "Поставки"
    | "Платёж"
    | "Бюджет"
    | "Согласование"
    | "Портфель"
    | "HR";
  critical?: boolean; // истинно только для реально критичного
}

// Общий пул задач — используется как fallback для «admin».
const WORK: WorkItem[] = [
  {
    id: "w1",
    state: "todo",
    bucket: "blocks",
    verb: "Согласовать заявку на бетон B25",
    context: "ЖК Аура · монолит блока 3",
    object: "ЖК Аура",
    due: "SLA · 2 ч",
    amount: "18,4 млн ₸",
    reason: "Блокирует заливку 14.07 · бригада 12 чел. в простое",
    source: "из /supply · заявка №4021",
    primary: { label: "Согласовать", to: "/supply" },
    category: "Заявки",
    critical: true,
  },
  {
    id: "w2",
    state: "todo",
    bucket: "blocks",
    verb: "Подписать акт КС-2 №142",
    context: "СМР монолит · подрядчик «БКМ-Строй»",
    object: "ЖК Аура",
    due: "сегодня до 18:00",
    amount: "48,2 млн ₸",
    reason: "Без визы удерживается платёж подрядчику",
    source: "из /finance · акт 142",
    primary: { label: "Подписать", to: "/finance", search: { from: "portal", act: "142" } },
    category: "Акты",
    critical: true,
  },
  {
    id: "w3",
    state: "todo",
    bucket: "overdue",
    verb: "Проверить исполнительную по фасаду",
    context: "ЖК Керуен · блок 2",
    object: "ЖК Керуен",
    due: "просрочено на 1 день",
    reason: "ПТО ждёт визы, чтобы закрыть этап",
    source: "из /pto",
    primary: { label: "Открыть", to: "/pto" },
    category: "ПТО",
  },
  {
    id: "w4",
    state: "todo",
    bucket: "overdue",
    verb: "Ответить на заявку на кран-манипулятор",
    context: "ЖК Атмосфера · монтаж",
    object: "ЖК Атмосфера",
    due: "просрочено на 2 дня",
    amount: "3,1 млн ₸",
    reason: "Срок поставки — пятница, риск сдвига графика",
    source: "из /supply · заявка №3987",
    primary: { label: "Согласовать", to: "/supply" },
    category: "Заявки",
  },
  {
    id: "w5",
    state: "todo",
    bucket: "today",
    verb: "Провести планёрку по ГПР",
    context: "Неделя · 214 работ",
    due: "сегодня 15:00",
    reason: "Плановая · отклонение по монолиту требует решения",
    source: "из /gpr",
    primary: { label: "К графику", to: "/gpr" },
    category: "ГПР",
  },
  {
    id: "w6",
    state: "todo",
    bucket: "today",
    verb: "Утвердить бюджет закупа плитки",
    context: "Керамика · экономия 1,2 млн ₸",
    due: "сегодня",
    amount: "12,8 млн ₸",
    reason: "Динара согласовала цену, ждёт финальной визы",
    source: "из /finance",
    primary: { label: "Утвердить", to: "/finance" },
    category: "Финансы",
  },
  {
    id: "w7",
    state: "todo",
    bucket: "next",
    verb: "Ознакомиться с новой политикой командировок",
    context: "HR · вступает в силу с 01.08",
    due: "до 20.07",
    reason: "Компания: обязательное ознакомление",
    source: "из Портала · Новости",
    primary: { label: "Прочитать", to: "/portal/news" },
    category: "Задачи",
  },
  {
    id: "w8",
    state: "waiting",
    verb: "Ждёт визы директора: акт КС-3 №088",
    context: "Кровля и фасад · «Тау-Стройсервис»",
    object: "ЖК Керуен",
    due: "у Асхата С. · 1 день",
    amount: "22,7 млн ₸",
    reason: "Передано на согласование выше",
    source: "из /finance",
    primary: { label: "Смотреть", to: "/finance" },
    category: "Акты",
  },
  {
    id: "w9",
    state: "waiting",
    verb: "Ждёт ответ поставщика по арматуре",
    context: "«Мет-Каз» · задержка 4 дня",
    object: "ЖК Аура",
    due: "ответ ждём сегодня",
    reason: "Открыт риск простоя бригады",
    source: "из /supply",
    primary: { label: "К заявке", to: "/supply" },
    category: "Заявки",
  },
  {
    id: "w10",
    state: "watching",
    verb: "На контроле: закрытие захватки 3-Б",
    context: "Ержан К. · опережение на 2 дня",
    object: "ЖК Аура",
    due: "до 16.07",
    reason: "Отслеживаю ход досрочного закрытия",
    source: "из /league",
    primary: { label: "К лиге", to: "/league" },
    category: "ГПР",
  },
  {
    id: "w11",
    state: "done",
    verb: "Подписан акт КС-2 №138",
    context: "Асхат С. · вчера",
    object: "ЖК Атмосфера",
    due: "закрыто вчера",
    amount: "31,6 млн ₸",
    reason: "Завершено",
    source: "из /finance",
    primary: { label: "Открыть", to: "/finance" },
    category: "Акты",
  },
];

interface Exception {
  id: string;
  kind: "stop" | "gpr" | "budget" | "milestone";
  title: string;
  detail: string;
  to: string;
}

const EXCEPTIONS: Exception[] = [
  {
    id: "e1",
    kind: "stop",
    title: "Риск остановки: арматура на Ауре",
    detail: "Поставщик задерживает 4 дня · бригада на паузе с 12.07",
    to: "/command",
  },
  {
    id: "e2",
    kind: "gpr",
    title: "Отклонение ГПР: монолит блока 3",
    detail: "–6 дней к графику, критический путь",
    to: "/gpr",
  },
  {
    id: "e3",
    kind: "budget",
    title: "К оплате перевалило 200 млн ₸",
    detail: "12 счетов · кассовый разрыв закрыт на неделю",
    to: "/finance",
  },
  {
    id: "e4",
    kind: "milestone",
    title: "Контрольная точка: сдача блока 1",
    detail: "ЖК Керуен · 18.07 · осталось 5 дней",
    to: "/object",
  },
];

const CALENDAR = [
  { time: "11:00", title: "Комитет по стройке", where: "Zoom" },
  { time: "15:00", title: "Планёрка ГПР · неделя 29", where: "Штаб Аура" },
  { time: "17:30", title: "1:1 · Ержан К.", where: "Офис · 4 эт." },
];

const RECENT = [
  { to: "/finance", label: "Финансы · акт 142", icon: FileSignature },
  { to: "/supply", label: "Снабжение · заявка 4021", icon: PackageSearch },
  { to: "/gpr", label: "ГПР · неделя 29", icon: Timer },
];

// ─────────────────────────────────────────────────────────────
// Ролевые конфигурации «Сегодня»
// Каркас общий, содержимое очереди / правой панели / быстрых действий — своё.
// ─────────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface SidePanelItem {
  id: string;
  title: string;
  detail: string;
  to?: string;
  tone?: "critical" | "warn" | "ok" | "muted";
  icon?: LucideIcon;
  right?: string; // правая колонка: сумма/дата/%
}

interface SidePanel {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: "critical" | "warn" | "accent" | "muted";
  items: SidePanelItem[];
}

interface KpiTile {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone: "ok" | "warn" | "critical" | "muted";
  to: string;
}

interface RoleHome {
  scopeLabel: string; // «Ваш скоуп: портфель» / «Ведущий объект: ЖК Аура»
  defaultObjectId?: string; // стартовый скоуп (например, ведущий объект РП)
  work: WorkItem[];
  panels: SidePanel[];
  quick: QuickAction[];
  kpi?: KpiTile[]; // только для директоров/собственника
}

// ── Снабженец · Динара ───────────────────────────────────────
const SUPPLY_WORK: WorkItem[] = [
  {
    id: "s1",
    state: "todo",
    bucket: "blocks",
    verb: "Взять заявку на бетон B25",
    context: "ЖК Аура · монолит блока 3 · 220 м³ · «Монолит-KZ»",
    object: "ЖК Аура",
    due: "SLA · 2 ч",
    amount: "18,4 млн ₸",
    reason: "Блокирует заливку 14.07 · простой бригады 12 чел.",
    source: "из /supply · заявка №4021",
    primary: { label: "Взять заявку", to: "/supply" },
    category: "Заявки",
    critical: true,
  },
  {
    id: "s2",
    state: "todo",
    bucket: "blocks",
    verb: "Подтвердить дату поставки арматуры A500",
    context: "«Мет-Каз» · 4,2 т Ø12 · сдвиг на 4 дня",
    object: "ЖК Аура",
    due: "до 12:00",
    amount: "9,7 млн ₸",
    reason: "Открыт риск простоя · Ержан ждёт решение",
    source: "поставка №217 · для «Монолит-KZ»",
    primary: { label: "Подтвердить дату", to: "/supply" },
    category: "Поставки",
    critical: true,
  },
  {
    id: "s3",
    state: "todo",
    bucket: "overdue",
    verb: "Согласовать замену: витражный профиль АГС-70 → АГС-72",
    context: "«АлюмФасад» · экономия 2,1 млн ₸ · тех. эквивалент",
    object: "ЖК Керуен",
    due: "просрочено на 1 день",
    reason: "Замена ждёт вашу визу перед отправкой в ПТО",
    source: "заявка №3990 · замена",
    primary: { label: "Согласовать замену", to: "/supply" },
    category: "Согласование",
  },
  {
    id: "s4",
    state: "todo",
    bucket: "overdue",
    verb: "Запросить КП по фасадным витражам · 2 этап",
    context: "3 поставщика · дедлайн монтажа — пятница",
    object: "ЖК Атмосфера",
    due: "просрочено на 2 дня",
    amount: "38,4 млн ₸",
    reason: "Без КП не выйдем в закуп",
    source: "заявка №3987",
    primary: { label: "Запросить КП", to: "/supply" },
    category: "Заявки",
  },
  {
    id: "s5",
    state: "todo",
    bucket: "today",
    verb: "Согласовать закуп лифтов Kone MonoSpace",
    context: "ЖК Атмосфера · 6 шт. · грузопассажирские",
    object: "ЖК Атмосфера",
    due: "сегодня",
    amount: "142 млн ₸",
    reason: "Долгий цикл поставки · без заказа сегодня — сдвиг ввода",
    source: "заявка №4032 · закуп оборудования",
    primary: { label: "Открыть", to: "/supply" },
    category: "Поставки",
  },
  {
    id: "s5b",
    state: "todo",
    bucket: "today",
    verb: "Проверить прайс: керамогранит 600×600",
    context: "3 поставщика · рост цены на 6% за месяц",
    due: "сегодня",
    reason: "Плановая ревизия · решение к закупу партии",
    source: "мониторинг цен",
    primary: { label: "Открыть", to: "/supply" },
    category: "Поставки",
  },
  {
    id: "s5c",
    state: "todo",
    bucket: "next",
    verb: "Собрать тендер: электромонтаж 3-я очередь",
    context: "«ЭлектроСтрой» + 2 претендента · слаботочка + силовая",
    object: "ЖК Аксай",
    due: "до 22.07",
    amount: "86,5 млн ₸",
    reason: "Плановая закупка · старт монтажа в августе",
    source: "план закупок Q3",
    primary: { label: "Открыть тендер", to: "/supply" },
    category: "Заявки",
  },
  {
    id: "s6",
    state: "waiting",
    verb: "Ждём подтверждение отгрузки: арматура A500",
    context: "«Мет-Каз» · 4,2 т · обещали до 16:00",
    object: "ЖК Аура",
    due: "ответ ждём сегодня",
    reason: "Ждём подтверждение · держим бригаду",
    source: "поставка №217",
    primary: { label: "К поставке", to: "/supply" },
    category: "Поставки",
  },
  {
    id: "s6b",
    state: "waiting",
    verb: "Ждём тех. согласование ПТО: замена витражей",
    context: "«АлюмФасад» · передано вчера в 17:20",
    object: "ЖК Керуен",
    due: "у ПТО · до завтра",
    reason: "Без визы ПТО закуп не пойдёт",
    source: "/pto · тикет 219",
    primary: { label: "Смотреть", to: "/pto" },
    category: "Согласование",
  },
  {
    id: "s7",
    state: "watching",
    verb: "На контроле: график поставок недели 29",
    context: "42 позиции · 3 под риском",
    due: "до 20.07",
    reason: "Отслеживаю выполнение SLA",
    source: "/supply · график",
    primary: { label: "К графику", to: "/supply" },
    category: "Поставки",
  },
  {
    id: "s8",
    state: "done",
    verb: "Закрыта заявка №4015 · утеплитель фасадный",
    context: "Отгружено вчера · в срок",
    object: "ЖК Атмосфера",
    due: "закрыто вчера",
    amount: "5,2 млн ₸",
    reason: "Завершено",
    source: "/supply",
    primary: { label: "Открыть", to: "/supply" },
    category: "Заявки",
  },
];

const SUPPLY_HOME: RoleHome = {
  scopeLabel: "Ваш скоуп: снабжение по портфелю",
  work: SUPPLY_WORK,
  quick: [
    { label: "Взять заявку", to: "/supply", icon: PackageSearch },
    { label: "Запросить КП", to: "/supply", icon: Megaphone },
    { label: "Подтвердить дату", to: "/supply", icon: Truck },
  ],
  panels: [
    {
      id: "risks",
      title: "Поставки под риском",
      subtitle: "Что сорвёт стройку, если не разрулить сегодня",
      icon: ShieldAlert,
      tone: "critical",
      items: [
        {
          id: "r1",
          title: "Арматура A500 · «Мет-Каз»",
          detail: "ЖК Аура · сдвиг 4 дня, бригада ждёт",
          right: "SLA −4д",
          tone: "critical",
          to: "/supply",
        },
        {
          id: "r2",
          title: "Витражи фасада · «АлюмФасад»",
          detail: "ЖК Атмосфера · КП не собрано",
          right: "risk",
          tone: "warn",
          to: "/supply",
        },
        {
          id: "r3",
          title: "Лифты Kone · long-lead",
          detail: "ЖК Атмосфера · срок поставки 14 нед",
          tone: "warn",
          to: "/supply",
        },
        {
          id: "r4",
          title: "Электромонтаж · «ЭлектроСтрой»",
          detail: "ЖК Аксай · тендер не запущен",
          right: "T−7д",
          tone: "warn",
          to: "/supply",
        },
      ],
    },
    {
      id: "shortage",
      title: "Дефициты недели",
      icon: PackageSearch,
      items: [
        { id: "d1", title: "Бетон B25", detail: "ЖК Аура · нужно 220 м³", right: "−80 м³", tone: "warn" },
        { id: "d2", title: "Арматура A500 Ø12", detail: "ЖК Аура · склад пуст", right: "−4,2 т", tone: "critical" },
        { id: "d3", title: "Витражный профиль АГС-72", detail: "ЖК Керуен · блок 2", right: "−320 пог.м", tone: "warn" },
        { id: "d4", title: "Утеплитель ПСБ-25", detail: "ЖК Керуен", right: "−120 м²", tone: "muted" },
      ],
    },
    {
      id: "sla",
      title: "SLA поставщиков",
      icon: Activity,
      items: [
        { id: "sl1", title: "«Мет-Каз»", detail: "Металл · 4 задержки за месяц", right: "72%", tone: "warn" },
        { id: "sl2", title: "«Монолит-KZ»", detail: "Монолитные работы · стабильно", right: "94%", tone: "ok" },
        { id: "sl3", title: "«АлюмФасад»", detail: "Фасадные витражи · 1 срыв", right: "88%", tone: "warn" },
        { id: "sl4", title: "«ЭлектроСтрой»", detail: "Электромонтаж · стабильно", right: "97%", tone: "ok" },
      ],
    },
  ],
};

// ── РП · Ержан ───────────────────────────────────────────────
const PM_WORK: WorkItem[] = [
  {
    id: "p1",
    state: "todo",
    bucket: "blocks",
    verb: "Решить: чем закрыть простой по арматуре A500",
    context: "ЖК Аура · «Монолит-KZ» · бригада 12 чел. на паузе",
    object: "ЖК Аура",
    due: "SLA · 3 ч",
    reason: "Блокирует критпуть · сдвиг заливки на 4 дня",
    source: "из /object · риск R-14",
    primary: { label: "Открыть риск", to: "/object" },
    category: "Риски",
    critical: true,
  },
  {
    id: "p2",
    state: "todo",
    bucket: "blocks",
    verb: "Подписать АВР-018: скрытые работы по кровле",
    context: "ЖК Аура · блок 2 · обнаружены трещины стяжки",
    object: "ЖК Аура",
    due: "сегодня до 15:00",
    amount: "4,8 млн ₸",
    reason: "Без акта скрытых работ ПТО остановит следующий этап",
    source: "из /pto · АВР-018",
    primary: { label: "Подписать АВР", to: "/pto" },
    category: "Акты",
    critical: true,
  },
  {
    id: "p3",
    state: "todo",
    bucket: "overdue",
    verb: "Согласовать заявку: доборные элементы витражей",
    context: "«АлюмФасад» · фасад блока 3 · ждёт снабжение",
    object: "ЖК Аура",
    due: "просрочено на 1 день",
    amount: "2,4 млн ₸",
    reason: "Динара ждёт визу перед закупом",
    source: "из /supply · заявка №4030",
    primary: { label: "Согласовать", to: "/supply" },
    category: "Заявки",
  },
  {
    id: "p4",
    state: "todo",
    bucket: "overdue",
    verb: "Закрыть просроченное обязательство: испытание бетона",
    context: "Лаборатория · протоколы B25 недели 28",
    object: "ЖК Аура",
    due: "просрочено на 2 дня",
    reason: "Без протоколов ПТО не примет этап",
    source: "из /pto",
    primary: { label: "К ПТО", to: "/pto" },
    category: "ПТО",
  },
  {
    id: "p5",
    state: "todo",
    bucket: "today",
    verb: "Провести планёрку ГПР недели 29",
    context: "214 работ · отклонение по монолиту",
    object: "ЖК Аура",
    due: "сегодня 15:00",
    reason: "Плановая · нужны решения по отклонениям",
    source: "из /gpr",
    primary: { label: "К графику", to: "/gpr" },
    category: "ГПР",
  },
  {
    id: "p6",
    state: "todo",
    bucket: "today",
    verb: "Эскалировать: «АлюмФасад» не выходит на ритм",
    context: "Витражи блока 3 · 3 срыва подряд по монтажу",
    object: "ЖК Аура",
    due: "сегодня",
    reason: "Требует решения выше · ставки растут",
    source: "лига подрядчиков",
    primary: { label: "Эскалировать", to: "/league" },
    category: "Риски",
  },
  {
    id: "p6b",
    state: "todo",
    bucket: "today",
    verb: "Согласовать КС-2 №145 по монолиту",
    context: "«Монолит-KZ» · этап монолит блока 2 · факт по журналу",
    object: "ЖК Аура",
    due: "сегодня до 18:00",
    amount: "36,4 млн ₸",
    reason: "Закрывает этап · далее — армирование",
    source: "из /finance · акт 145",
    primary: { label: "Согласовать", to: "/finance", search: { from: "portal", act: "145" } },
    category: "Акты",
  },
  {
    id: "p6c",
    state: "todo",
    bucket: "next",
    verb: "Утвердить план монтажа лифтов",
    context: "ЖК Атмосфера · 6 шт. Kone · старт октября",
    object: "ЖК Атмосфера",
    due: "до 21.07",
    reason: "Синхронизация с шахтой и электрикой",
    source: "/object · план монтажа",
    primary: { label: "Открыть план", to: "/object" },
    category: "Задачи",
  },
  {
    id: "p7",
    state: "waiting",
    verb: "Ждём визу директора по акту КС-3 №088",
    context: "Кровля и фасад · «АлюмФасад»",
    object: "ЖК Керуен",
    due: "у Асхата С. · 1 день",
    amount: "22,7 млн ₸",
    reason: "Передано на согласование выше",
    source: "из /finance",
    primary: { label: "Смотреть", to: "/finance" },
    category: "Акты",
  },
  {
    id: "p8",
    state: "watching",
    verb: "На контроле: закрытие захватки 3-Б",
    context: "«Монолит-KZ» · опережение на 2 дня",
    object: "ЖК Аура",
    due: "до 16.07",
    reason: "Слежу за досрочным закрытием",
    source: "/league",
    primary: { label: "К лиге", to: "/league" },
    category: "ГПР",
  },
  {
    id: "p9",
    state: "done",
    verb: "Подписан АВР-017: устройство черновой стяжки",
    context: "ЖК Аура · блок 1 · вчера в 17:40",
    object: "ЖК Аура",
    due: "закрыто вчера",
    amount: "6,1 млн ₸",
    reason: "Завершено",
    source: "/pto",
    primary: { label: "Открыть", to: "/pto" },
    category: "Акты",
  },
];

const PM_HOME: RoleHome = {
  scopeLabel: "Ведущий объект: ЖК Аура",
  defaultObjectId: "aura",
  work: PM_WORK,
  quick: [
    { label: "Назначить владельца", to: "/rp", icon: Users },
    { label: "Открыть риск", to: "/object", icon: ShieldAlert },
    { label: "Эскалировать", to: "/league", icon: TrendingDown },
    { label: "Заявка на материал", to: "/supply", icon: PackageSearch },
  ],
  panels: [
    {
      id: "gpr",
      title: "Отклонения ГПР · критпуть",
      subtitle: "Работы, которые тянут срок вниз",
      icon: TrendingDown,
      tone: "critical",
      items: [
        { id: "g1", title: "Монолит блока 3", detail: "ЖК Аура · критпуть", right: "−6 дн", tone: "critical", to: "/gpr" },
        { id: "g2", title: "Витражи фасада", detail: "ЖК Аура · «АлюмФасад»", right: "−3 дн", tone: "warn", to: "/gpr" },
        { id: "g3", title: "«АлюмФасад» · ритм", detail: "3 срыва подряд по монтажу", right: "risk", tone: "warn", to: "/league" },
        { id: "g4", title: "Испытания бетона", detail: "Протоколы недели 28 · ПТО", right: "−2 дн", tone: "warn", to: "/pto" },
      ],
    },
    {
      id: "next14",
      title: "Ближайшие 14 дней",
      icon: Calendar,
      items: [
        { id: "n1", title: "Заливка блока 3 · B25", detail: "14.07 · зависит от арматуры", right: "T−1", tone: "warn" },
        { id: "n2", title: "Сдача блока 1", detail: "18.07 · контрольная точка", right: "T+5", tone: "muted" },
        { id: "n3", title: "Испытания фасадных витражей", detail: "22.07 · «АлюмФасад»", right: "T+9", tone: "muted" },
        { id: "n4", title: "Старт монтажа лифтов", detail: "26.07 · ЖК Атмосфера", right: "T+13", tone: "muted" },
      ],
    },
    {
      id: "brigades",
      title: "Бригады онлайн",
      icon: HardHat,
      items: [
        { id: "b1", title: "Монолит · «Монолит-KZ»", detail: "12 чел. · ждут арматуру A500", right: "пауза", tone: "warn" },
        { id: "b2", title: "Отделка · Данияр Т.", detail: "18 чел. · работают", right: "OK", tone: "ok" },
        { id: "b3", title: "Витражи · «АлюмФасад»", detail: "8 чел. · вне ритма", right: "risk", tone: "warn" },
        { id: "b4", title: "Электрика · «ЭлектроСтрой»", detail: "6 чел. · слаботочка", right: "OK", tone: "ok" },
      ],
    },
  ],
};

// ── Финдир · Мадина ──────────────────────────────────────────
const FIN_WORK: WorkItem[] = [
  {
    id: "f1",
    state: "todo",
    bucket: "blocks",
    verb: "Проверить пакет по акту КС-2 №142",
    context: "«Монолит-KZ» · монолит блока 2 · нужна виза до 18:00",
    object: "ЖК Аура",
    due: "SLA · 4 ч",
    amount: "48,2 млн ₸",
    reason: "Без визы задерживается платёж подрядчику",
    source: "/finance · акт 142",
    primary: { label: "Проверить пакет", to: "/finance" },
    category: "Акты",
    critical: true,
  },
  {
    id: "f2",
    state: "todo",
    bucket: "blocks",
    verb: "Согласовать аванс «Монолит-KZ» под бетон B25",
    context: "Аванс 30% под заливку 14.07 · 220 м³",
    object: "ЖК Аура",
    due: "сегодня до 14:00",
    amount: "18,4 млн ₸",
    reason: "Без аванса — нет отгрузки, простой бригады",
    source: "платёжный реестр",
    primary: { label: "Согласовать", to: "/finance" },
    category: "Платёж",
    critical: true,
  },
  {
    id: "f3",
    state: "todo",
    bucket: "overdue",
    verb: "Вернуть на доработку КС-3 №140",
    context: "«АлюмФасад» · расхождение объёмов витражей на 3,4%",
    object: "ЖК Керуен",
    due: "просрочено на 1 день",
    amount: "22,7 млн ₸",
    reason: "Не сходятся объёмы с исполнительной ПТО",
    source: "/finance · акт 140",
    primary: { label: "Вернуть", to: "/finance" },
    category: "Акты",
  },
  {
    id: "f3b",
    state: "todo",
    bucket: "overdue",
    verb: "Провести АВР-015: скрытые работы",
    context: "«АлюмФасад» · утепление узлов витражей · зелёный СБ",
    object: "ЖК Аура",
    due: "просрочено на 2 дня",
    amount: "12,8 млн ₸",
    reason: "Полный пакет собран · последняя виза за вами",
    source: "/finance · АВР-015",
    primary: { label: "Провести", to: "/finance", search: { from: "portal", act: "АВР-015" } },
    category: "Акты",
  },
  {
    id: "f4",
    state: "todo",
    bucket: "today",
    verb: "Решить по отклонению бюджета: витражи фасада",
    context: "«АлюмФасад» · +8% к бюджету статьи · рост цен алюминия",
    object: "ЖК Атмосфера",
    due: "сегодня",
    amount: "+4,6 млн ₸",
    reason: "Отклонение выше порога 5% · нужно решение",
    source: "бюджет · статья 4.2.1 (фасад)",
    primary: { label: "Открыть отклонение", to: "/finance" },
    category: "Бюджет",
  },
  {
    id: "f5",
    state: "todo",
    bucket: "today",
    verb: "Согласовать платёжный календарь недели 30",
    context: "34 платежа · 412 млн ₸ · включая лифты Kone",
    due: "сегодня 17:00",
    amount: "412 млн ₸",
    reason: "Плановое согласование недельного календаря",
    source: "/finance · календарь",
    primary: { label: "Согласовать", to: "/finance" },
    category: "Финансы",
  },
  {
    id: "f5b",
    state: "todo",
    bucket: "next",
    verb: "Согласовать КС-3 №012 · «ЭлектроСтрой»",
    context: "ЖК Керуен · оплата к пятнице · чек-лист аудита готов",
    object: "ЖК Керуен",
    due: "до 18.07",
    amount: "14,3 млн ₸",
    reason: "Финальная виза перед казначейством",
    source: "/finance · КС-3-012",
    primary: { label: "Согласовать", to: "/finance", search: { from: "portal", act: "КС-3-012" } },
    category: "Акты",
  },
  {
    id: "f6",
    state: "waiting",
    verb: "Ждём подписи собственника: заём на кассовый разрыв",
    context: "Ержан + Данияр А. · 60 млн ₸ · 30 дней",
    due: "у Данияра А. · 1 день",
    amount: "60 млн ₸",
    reason: "Передано на подпись выше",
    source: "казначейство",
    primary: { label: "Смотреть", to: "/finance" },
    category: "Финансы",
  },
  {
    id: "f6b",
    state: "waiting",
    verb: "Ждём исполнительную ПТО по КС-3 №140",
    context: "«АлюмФасад» · Айгуль Т. · возврат на пересчёт",
    object: "ЖК Керуен",
    due: "у ПТО · до завтра",
    reason: "Без исправлений не примем в оплату",
    source: "/pto",
    primary: { label: "К ПТО", to: "/pto" },
    category: "Акты",
  },
  {
    id: "f7",
    state: "watching",
    verb: "На контроле: маржа ЖК Керуен",
    context: "Прогноз −1,2 п.п. к плану",
    object: "ЖК Керуен",
    due: "до конца месяца",
    reason: "Отслеживаю по недельным закрытиям",
    source: "/portfolio",
    primary: { label: "К портфелю", to: "/portfolio" },
    category: "Портфель",
  },
  {
    id: "f8",
    state: "done",
    verb: "Проведён платёж «Монолит-KZ» по КС-2 №138",
    context: "ЖК Атмосфера · вчера · казначейство",
    object: "ЖК Атмосфера",
    due: "закрыто вчера",
    amount: "31,6 млн ₸",
    reason: "Завершено",
    source: "/finance",
    primary: { label: "Открыть", to: "/finance" },
    category: "Платёж",
  },
];

const FIN_HOME: RoleHome = {
  scopeLabel: "Ваш скоуп: портфель",
  work: FIN_WORK,
  quick: [
    { label: "Проверить пакет", to: "/finance", icon: FileSignature },
    { label: "Согласовать", to: "/finance", icon: CheckCircle2 },
    { label: "Вернуть на доработку", to: "/finance", icon: ArrowRight },
  ],
  panels: [
    {
      id: "liquidity",
      title: "Ликвидность · 14 дней",
      subtitle: "Платёжный календарь и разрыв",
      icon: LineChart,
      tone: "warn",
      items: [
        { id: "l1", title: "Остаток на счетах", detail: "3 банка · сегодня", right: "218 млн ₸", tone: "ok" },
        { id: "l2", title: "К оплате за 14 дн", detail: "34 счёта", right: "412 млн ₸", tone: "warn" },
        { id: "l3", title: "Кассовый разрыв", detail: "прогноз 22.07", right: "−78 млн ₸", tone: "critical" },
        { id: "l4", title: "Поступления · оф. продажи", detail: "прогноз 14 дн", right: "+164 млн ₸", tone: "ok" },
      ],
    },
    {
      id: "limits",
      title: "Лимиты и превышения",
      icon: ShieldAlert,
      items: [
        { id: "lm1", title: "Витражи · ЖК Атмосфера", detail: "«АлюмФасад» · статья 4.2.1", right: "+8%", tone: "warn" },
        { id: "lm2", title: "Арматура A500 · ЖК Аура", detail: "статья 2.1.3", right: "+5%", tone: "warn" },
        { id: "lm3", title: "Лифты Kone · ЖК Атмосфера", detail: "статья 6.3", right: "+2%", tone: "muted" },
        { id: "lm4", title: "Логистика · портфель", detail: "статья 5.1", right: "+11%", tone: "critical" },
      ],
    },
    {
      id: "big",
      title: "Крупные исключения",
      icon: Coins,
      items: [
        { id: "e1", title: "КС-2 №142", detail: "«Монолит-KZ» · ждёт визы", right: "48,2 млн", tone: "critical", to: "/finance" },
        { id: "e2", title: "Возврат КС-3 №140", detail: "«АлюмФасад» · расхождение", right: "22,7 млн", tone: "warn", to: "/finance" },
        { id: "e3", title: "АВР-015 · скрытые работы", detail: "«АлюмФасад» · зелёный СБ", right: "12,8 млн", tone: "warn", to: "/finance" },
        { id: "e4", title: "Заём на разрыв", detail: "у собственника", right: "60 млн", tone: "muted" },
      ],
    },
  ],
};

// ── Директор по стройке / Собственник ────────────────────────
const EXEC_WORK: WorkItem[] = [
  {
    id: "x1",
    state: "todo",
    bucket: "blocks",
    verb: "Эскалация: срыв бетонирования на ЖК Аура",
    context: "Ержан К. + Динара М. · критпуть под угрозой",
    object: "ЖК Аура",
    due: "SLA · 4 ч",
    reason: "Портфельное исключение · сдвигает ввод объекта",
    source: "из /command",
    primary: { label: "Назначить разбор", to: "/command" },
    category: "Риски",
    critical: true,
  },
  {
    id: "x2",
    state: "todo",
    bucket: "blocks",
    verb: "Решить: подрядчик «Тау-С» — санкции или замена",
    context: "3 срыва подряд · 2 объекта",
    due: "сегодня",
    reason: "Ставки растут · нужно решение владельца",
    source: "лига подрядчиков",
    primary: { label: "Открыть решение", to: "/league" },
    category: "Риски",
    critical: true,
  },
  {
    id: "x3",
    state: "todo",
    bucket: "overdue",
    verb: "Утвердить заём на закрытие кассового разрыва",
    context: "От финдира · 60 млн ₸ · 30 дней",
    due: "просрочено на 1 день",
    amount: "60 млн ₸",
    reason: "Прогноз разрыва 22.07",
    source: "казначейство",
    primary: { label: "Открыть", to: "/finance" },
    category: "Финансы",
  },
  {
    id: "x4",
    state: "todo",
    bucket: "today",
    verb: "Разбор портфельного отклонения ГПР",
    context: "3 объекта в красной зоне",
    due: "сегодня 16:00",
    reason: "Планёрка портфеля",
    source: "/portfolio",
    primary: { label: "К портфелю", to: "/portfolio" },
    category: "Портфель",
  },
  {
    id: "x5",
    state: "waiting",
    verb: "Жду решение по контрактации ЖК Аксай-2",
    context: "Юр + финансы · 2-я очередь",
    due: "у юристов · 2 дня",
    reason: "Передано в проработку",
    source: "/portfolio",
    primary: { label: "Смотреть", to: "/portfolio" },
    category: "Портфель",
  },
  {
    id: "x6",
    state: "watching",
    verb: "На контроле: маржа портфеля Q3",
    context: "Прогноз −0,8 п.п. к плану",
    due: "до конца квартала",
    reason: "Слежу по недельным закрытиям",
    source: "/portfolio",
    primary: { label: "К портфелю", to: "/portfolio" },
    category: "Портфель",
  },
];

const EXEC_HOME: RoleHome = {
  scopeLabel: "Ваш скоуп: портфель · 9 объектов",
  work: EXEC_WORK,
  quick: [
    { label: "Назначить разбор", to: "/command", icon: Users },
    { label: "Эскалировать", to: "/league", icon: TrendingDown },
    { label: "Открыть объект", to: "/object", icon: Building2 },
  ],
  kpi: [
    { id: "k1", label: "Готовность", value: "63%", delta: "+2 п.п. к неделе", tone: "ok", to: "/portfolio" },
    { id: "k2", label: "Отклонение ГПР", value: "−4 дн", delta: "3 объекта в красной", tone: "warn", to: "/gpr" },
    { id: "k3", label: "Кассовый разрыв", value: "−78 млн ₸", delta: "прогноз 22.07", tone: "critical", to: "/finance" },
    { id: "k4", label: "Риски высокие", value: "7", delta: "+2 за неделю", tone: "warn", to: "/command" },
  ],
  panels: [
    {
      id: "map",
      title: "Карта объектов · 9",
      subtitle: "Светофор по срокам · клик — детально",
      icon: MapIcon,
      items: [
        { id: "o1", title: "ЖК Аура", detail: "монолит · критпуть", right: "−6 дн", tone: "critical", to: "/object" },
        { id: "o2", title: "ЖК Атмосфера", detail: "отделка", right: "−1 дн", tone: "warn", to: "/object" },
        { id: "o3", title: "ЖК Керуен", detail: "фасад", right: "OK", tone: "ok", to: "/object" },
        { id: "o4", title: "ЖК Аксай", detail: "котлован", right: "OK", tone: "ok", to: "/object" },
        { id: "o5", title: "ЖК Байтерек", detail: "монолит", right: "+2 дн", tone: "ok", to: "/object" },
        { id: "o6", title: "ЖК Сарыарка", detail: "фасад", right: "OK", tone: "ok", to: "/object" },
        { id: "o7", title: "ЖК Астана-Grand", detail: "отделка", right: "−2 дн", tone: "warn", to: "/object" },
        { id: "o8", title: "ЖК Тау-2", detail: "инженерка", right: "OK", tone: "ok", to: "/object" },
        { id: "o9", title: "ЖК Есиль", detail: "старт", right: "old", tone: "muted", to: "/object" },
      ],
    },
    {
      id: "forecast",
      title: "Прогноз ввода",
      icon: LineChart,
      items: [
        { id: "fc1", title: "ЖК Аура · блок 1", detail: "план 18.07", right: "T+5", tone: "warn" },
        { id: "fc2", title: "ЖК Атмосфера", detail: "план сент.", right: "OK", tone: "ok" },
        { id: "fc3", title: "ЖК Керуен", detail: "план нояб.", right: "OK", tone: "ok" },
      ],
    },
    {
      id: "deps",
      title: "Критические зависимости",
      icon: ShieldAlert,
      tone: "warn",
      items: [
        { id: "dp1", title: "Арматура «Мет-Каз»", detail: "2 объекта зависят", right: "risk", tone: "critical" },
        { id: "dp2", title: "Подрядчик «Тау-С»", detail: "фасад · 2 объекта", right: "risk", tone: "warn" },
        { id: "dp3", title: "Разрешение — блок 1", detail: "акимат · 12.07", right: "жду", tone: "muted" },
      ],
    },
  ],
};

// ── Офисный сотрудник ────────────────────────────────────────
const OFFICE_WORK: WorkItem[] = [
  {
    id: "o1",
    state: "todo",
    bucket: "blocks",
    verb: "Согласовать заявку на командировку",
    context: "От Ержана К. · Астана, 16–18.07",
    due: "сегодня",
    reason: "Ержан ждёт визу для покупки билетов",
    source: "Портал · согласования",
    primary: { label: "Согласовать", to: "/portal" },
    category: "Согласование",
  },
  {
    id: "o2",
    state: "todo",
    bucket: "overdue",
    verb: "Обязательное ознакомление: политика ИБ 2026",
    context: "HR · вступила в силу 01.07",
    due: "просрочено на 3 дня",
    reason: "Обязательное для всех сотрудников",
    source: "Портал · HR",
    primary: { label: "Ответить", to: "/portal/news" },
    category: "HR",
  },
  {
    id: "o3",
    state: "todo",
    bucket: "today",
    verb: "Пройти опрос вовлечённости Q3",
    context: "HR · 12 вопросов · анонимно",
    due: "сегодня",
    reason: "Ежеквартальный опрос",
    source: "Портал · HR",
    primary: { label: "Ответить", to: "/portal" },
    category: "HR",
  },
  {
    id: "o4",
    state: "todo",
    bucket: "today",
    verb: "Записаться на медосмотр",
    context: "Клиника «Достар» · 15–19.07",
    due: "до 19.07",
    reason: "Плановый годовой",
    source: "Портал · HR",
    primary: { label: "Записаться", to: "/portal" },
    category: "HR",
  },
  {
    id: "o5",
    state: "todo",
    bucket: "next",
    verb: "Создать запрос в IT: доступ к 1С",
    context: "Модуль зарплаты · новая роль",
    due: "до 20.07",
    reason: "Начало квартала",
    source: "Портал · запросы",
    primary: { label: "Создать запрос", to: "/portal" },
    category: "Задачи",
  },
  {
    id: "o6",
    state: "waiting",
    verb: "Жду ответ по обращению №2145",
    context: "Пропуск на парковку · IT",
    due: "SLA · 1 день",
    reason: "В работе у IT",
    source: "Портал · обращения",
    primary: { label: "Открыть", to: "/portal" },
    category: "Задачи",
  },
  {
    id: "o7",
    state: "done",
    verb: "Прочитано: правила командировок",
    context: "HR · вчера",
    due: "закрыто вчера",
    reason: "Завершено",
    source: "Портал · HR",
    primary: { label: "Открыть", to: "/portal/news" },
    category: "HR",
  },
];

const OFFICE_HOME: RoleHome = {
  scopeLabel: "Ваш скоуп: личная работа",
  work: OFFICE_WORK,
  quick: [
    { label: "Ответить", to: "/portal", icon: CheckCircle2 },
    { label: "Записаться", to: "/portal", icon: Calendar },
    { label: "Создать запрос", to: "/portal", icon: ClipboardList },
  ],
  panels: [
    {
      id: "cal",
      title: "Сегодня в календаре",
      icon: Calendar,
      items: [
        { id: "c1", title: "11:00 · Комитет по стройке", detail: "Zoom", right: "11:00", tone: "muted" },
        { id: "c2", title: "14:00 · 1:1 с руководителем", detail: "Офис · 3 эт.", right: "14:00", tone: "muted" },
        { id: "c3", title: "16:30 · Опрос вовлечённости", detail: "напоминание HR", right: "16:30", tone: "warn" },
      ],
    },
    {
      id: "news",
      title: "Важные объявления",
      icon: Megaphone,
      items: [
        { id: "n1", title: "Новая политика командировок", detail: "с 01.08 · обязательно к прочтению", tone: "warn", to: "/portal/news" },
        { id: "n2", title: "Корпоратив 24.08", detail: "запись до 10.08", tone: "muted", to: "/portal/news" },
        { id: "n3", title: "Обновление ДМС", detail: "новые клиники в сети", tone: "muted", to: "/portal/news" },
      ],
    },
    {
      id: "requests",
      title: "Мои обращения",
      icon: Bell,
      items: [
        { id: "rq1", title: "№2145 · Пропуск на парковку", detail: "IT · в работе", right: "1 день", tone: "muted", to: "/portal" },
        { id: "rq2", title: "№2138 · Замена ноутбука", detail: "IT · назначена дата", right: "18.07", tone: "ok", to: "/portal" },
        { id: "rq3", title: "№2101 · Справка НДФЛ", detail: "HR · готово", right: "OK", tone: "ok", to: "/portal" },
      ],
    },
  ],
};

// ── Fallback (админ) — берём общий пул и панели дефолтные ────
const DEFAULT_PANELS: SidePanel[] = [
  {
    id: "situation",
    title: "Ситуация",
    subtitle: "Только исключения — не второй список уведомлений",
    icon: ShieldAlert,
    tone: "critical",
    items: [
      { id: "e1", title: "Риск остановки: арматура на Ауре", detail: "Поставщик задерживает 4 дня", tone: "critical", to: "/command" },
      { id: "e2", title: "Отклонение ГПР: монолит блока 3", detail: "−6 дней · критпуть", tone: "critical", to: "/gpr" },
      { id: "e3", title: "К оплате перевалило 200 млн ₸", detail: "12 счетов", tone: "warn", to: "/finance" },
      { id: "e4", title: "Сдача блока 1", detail: "ЖК Керуен · 18.07", tone: "muted", to: "/object" },
    ],
  },
  {
    id: "cal",
    title: "Сегодня в календаре",
    icon: Calendar,
    items: CALENDAR.map((c, i) => ({
      id: `cal${i}`,
      title: `${c.time} · ${c.title}`,
      detail: c.where,
      right: c.time,
      tone: "muted" as const,
    })),
  },
  {
    id: "recent",
    title: "Недавно открывал",
    icon: History,
    items: RECENT.map((r, i) => ({
      id: `rec${i}`,
      title: r.label,
      detail: "",
      tone: "muted" as const,
      to: r.to,
    })),
  },
];

const ADMIN_HOME: RoleHome = {
  scopeLabel: "Полный доступ · демо",
  work: WORK,
  quick: [
    { label: "К командному центру", to: "/command", icon: Users },
    { label: "К портфелю", to: "/portfolio", icon: Building2 },
    { label: "К ГПР", to: "/gpr", icon: Timer },
  ],
  panels: DEFAULT_PANELS,
};

const ROLE_HOME: Record<Role, RoleHome> = {
  admin: ADMIN_HOME,
  owner: EXEC_HOME,
  construction_dir: EXEC_HOME,
  pm: PM_HOME,
  foreman: {
    scopeLabel: "Ваш скоуп: сегодняшняя смена",
    work: PM_WORK.filter((w) => w.object === "ЖК Аура").slice(0, 4),
    quick: [
      { label: "Отчёт факта", to: "/foreman", icon: CheckCircle2 },
      { label: "Фото-отчёт", to: "/foreman", icon: Eye },
      { label: "Заявка", to: "/supply", icon: PackageSearch },
    ],
    panels: [
      {
        id: "shift",
        title: "Смена сегодня",
        icon: HardHat,
        items: [
          { id: "sh1", title: "Бригада монолит · 12 чел.", detail: "ждут бетон", tone: "warn" },
          { id: "sh2", title: "Заливка блока 3", detail: "план 14.07 · зависит от бетона", tone: "warn" },
        ],
      },
    ],
  },
  supply: SUPPLY_HOME,
  pto: ADMIN_HOME,
  finance: FIN_HOME,
  office: OFFICE_HOME,
};

// ─────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────

function CategoryIcon({ c }: { c: WorkItem["category"] }) {
  const map: Record<WorkItem["category"], LucideIcon> = {
    Заявки: PackageSearch,
    Акты: FileSignature,
    ГПР: Timer,
    Риски: Flame,
    ПТО: FileSignature,
    Финансы: Wallet,
    Задачи: CheckCircle2,
    Поставки: Truck,
    Платёж: Coins,
    Бюджет: LineChart,
    Согласование: FileSignature,
    Портфель: Building2,
    HR: Users,
  };
  const Icon = map[c];
  return <Icon className="h-4 w-4" />;
}

function BucketLabel({ b }: { b: Bucket }) {
  const map: Record<Bucket, { icon: LucideIcon; label: string; tone: string }> = {
    blocks: { icon: Ban, label: "Блокирует", tone: "text-destructive" },
    overdue: { icon: AlertTriangle, label: "Просрочено", tone: "text-destructive" },
    today: { icon: Calendar, label: "Сегодня", tone: "text-foreground" },
    next: { icon: ChevronRight, label: "Далее", tone: "text-muted-foreground" },
  };
  const s = map[b];
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${s.tone}`}>
      <s.icon className="h-3.5 w-3.5" />
      {s.label}
    </div>
  );
}

function ExceptionIcon({ kind }: { kind: Exception["kind"] }) {
  const map: Record<Exception["kind"], { icon: LucideIcon; tone: string }> = {
    stop: { icon: ShieldAlert, tone: "text-destructive" },
    gpr: { icon: TrendingDown, tone: "text-destructive" },
    budget: { icon: Wallet, tone: "text-accent-foreground" },
    milestone: { icon: Flame, tone: "text-accent-foreground" },
  };
  const s = map[kind];
  return (
    <div
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted ${s.tone}`}
    >
      <s.icon className="h-4 w-4" />
    </div>
  );
}

function TodayPage() {
  const { persona, role } = useRole();
  const { selectedObject, setObjectId, objects } = useWorkspace();
  const home = ROLE_HOME[role] ?? ADMIN_HOME;
  const [tab, setTab] = useState<WorkState>("todo");
  const [sheet, setSheet] = useState<WorkItem | null>(null);
  const [overrides, setOverrides] = useState<
    Record<string, { state: WorkState; bucket?: Bucket; note?: string }>
  >({});
  // Ось объекта к личной очереди — только по явному запросу.
  const [scopeQueue, setScopeQueue] = useState(false);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [greeting, setGreeting] = useState("Добрый день");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер");
  }, []);

  // Стартовый скоуп РП — «ведущий объект». Ставим один раз при первом заходе роли.
  useEffect(() => {
    if (home.defaultObjectId && objects.some((o) => o.id === home.defaultObjectId)) {
      const key = `atlas.home.scope.${role}`;
      try {
        if (!localStorage.getItem(key)) {
          setObjectId(home.defaultObjectId);
          localStorage.setItem(key, "1");
        }
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const scoped = useMemo(() => {
    const short = selectedObject.short;
    return home.work
      .map((w) => {
        const o = overrides[w.id];
        if (!o) return w;
        return { ...w, state: o.state, bucket: o.bucket ?? w.bucket };
      })
      .filter((w) => {
        if (!scopeQueue || selectedObject.id === "all") return true;
        if (!w.object) return true;
        return w.object.includes(short);
      });
  }, [selectedObject, overrides, home.work, scopeQueue]);

  // Сколько дел из очереди относится к выбранному объекту — для подсказки в чипе.
  const objectMatches = useMemo(() => {
    if (selectedObject.id === "all") return 0;
    const short = selectedObject.short;
    return home.work.filter(
      (w) => w.object && w.object.includes(short),
    ).length;
  }, [selectedObject, home.work]);

  const counts = useMemo(
    () => ({
      todo: scoped.filter((w) => w.state === "todo").length,
      waiting: scoped.filter((w) => w.state === "waiting").length,
      watching: scoped.filter((w) => w.state === "watching").length,
      done: scoped.filter((w) => w.state === "done").length,
    }),
    [scoped],
  );

  const todoBuckets = useMemo(() => {
    const buckets: Bucket[] = ["blocks", "overdue", "today", "next"];
    return buckets
      .map((b) => ({
        bucket: b,
        items: scoped.filter((w) => w.state === "todo" && w.bucket === b),
      }))
      .filter((g) => g.items.length > 0);
  }, [scoped]);

  const activeList = useMemo(
    () => (tab === "todo" ? [] : scoped.filter((w) => w.state === tab)),
    [tab, scoped],
  );

  const overdueCount = scoped.filter(
    (w) => w.state === "todo" && w.bucket === "overdue",
  ).length;
  const blocksCount = scoped.filter(
    (w) => w.state === "todo" && w.bucket === "blocks",
  ).length;

  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Фокус на следующее дело после действия по текущему id.
  const focusNext = useCallback(
    (id: string) => {
      const list =
        tab === "todo"
          ? scoped.filter((w) => w.state === "todo")
          : scoped.filter((w) => w.state === tab);
      const idx = list.findIndex((w) => w.id === id);
      const next = list[idx + 1] ?? list[idx - 1];
      if (!next) return;
      requestAnimationFrame(() => {
        rowRefs.current[next.id]?.focus();
      });
    },
    [tab, scoped],
  );

  const complete = (w: WorkItem) => {
    setOverrides((s) => ({ ...s, [w.id]: { state: "done" } }));
    toast.success("Готово", { description: `${w.primary.label}: ${w.verb}`, duration: 1600 });
    if (sheet?.id === w.id) setSheet(null);
    focusNext(w.id);
  };

  const postpone = (w: WorkItem, until: "tomorrow" | "friday") => {
    const label = until === "tomorrow" ? "до завтра" : "до пятницы";
    setOverrides((s) => ({
      ...s,
      [w.id]: { state: "todo", bucket: "next", note: label },
    }));
    toast("Отложено · " + label, { duration: 1400 });
    if (sheet?.id === w.id) setSheet(null);
    focusNext(w.id);
  };

  const delegate = (w: WorkItem) => {
    setOverrides((s) => ({ ...s, [w.id]: { state: "waiting" } }));
    toast("Делегировано · дело в «Жду»", { duration: 1400 });
    if (sheet?.id === w.id) setSheet(null);
    focusNext(w.id);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      {/* Строка контекста */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
            {greeting}, {persona.greetingName}.{" "}
            <span className="text-muted-foreground font-semibold capitalize">
              {today}
            </span>
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{home.scopeLabel}</span>
              {" · "}
              <span>объект: <span className="font-semibold text-foreground">{selectedObject.short}</span></span>
            </span>
            <span aria-hidden>·</span>
            <span className="tnum">
              <span className="font-bold text-foreground">{counts.todo}</span> действий
            </span>
            {overdueCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="tnum font-bold text-destructive">
                  {overdueCount} просрочено
                </span>
              </>
            )}
            {blocksCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="tnum font-bold text-destructive">
                  {blocksCount} блокирует стройку
                </span>
              </>
            )}
          </p>
        </div>
      </header>

      {/* Скоуп-чип: «показать только <объект>» — молча очередь не режем */}
      {selectedObject.id !== "all" && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 text-[11px]">
          <span className="font-semibold text-muted-foreground">
            Личная очередь · весь контур ответственности
          </span>
          <button
            type="button"
            onClick={() => setScopeQueue((v) => !v)}
            aria-pressed={scopeQueue}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
              scopeQueue
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-background text-foreground hover:border-primary"
            }`}
          >
            {scopeQueue ? "✓ " : ""}
            Показать только: {selectedObject.short}
            <span className="tnum ml-1 rounded-full bg-background/40 px-1 text-[10px]">
              {objectMatches}
            </span>
          </button>
          {scopeQueue && (
            <span className="text-[10px] uppercase tracking-[0.1em] text-accent-foreground">
              фильтр применён · остальные скрыты
            </span>
          )}
        </div>
      )}

      {/* KPI-строка только для директоров/собственника */}
      {home.kpi && home.kpi.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {home.kpi.map((k) => (
            <Link
              key={k.id}
              to={k.to}
              className="card-soft group flex flex-col gap-1 p-3 transition-colors hover:border-primary"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {k.label}
              </div>
              <div
                className={`tnum text-xl font-extrabold ${
                  k.tone === "critical"
                    ? "text-destructive"
                    : k.tone === "warn"
                      ? "text-accent-foreground"
                      : k.tone === "ok"
                        ? "text-success"
                        : "text-foreground"
                }`}
              >
                {k.value}
              </div>
              {k.delta && (
                <div className="truncate text-[11px] text-muted-foreground">{k.delta}</div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Быстрые действия — ролевые */}
      {home.quick.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Быстрые действия
          </span>
          {home.quick.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[12px] font-bold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              <q.icon className="h-3.5 w-3.5" />
              {q.label}
            </Link>
          ))}
        </div>
      )}

      {/* Ядро: очередь слева + ситуация справа */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* МОЯ РАБОТА */}
        <section className="card-soft flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold leading-tight">Моя работа</h2>
              <p className="text-[11px] text-muted-foreground">
                Личная очередь · клик по строке — детали справа, действие — в один тап
              </p>
            </div>
            <div
              role="tablist"
              aria-label="Состояние работы"
              className="inline-flex rounded-full border border-border bg-muted/50 p-0.5 text-[11px] font-bold"
            >
              {([
                ["todo", "Сделать", counts.todo],
                ["waiting", "Жду", counts.waiting],
                ["watching", "На контроле", counts.watching],
                ["done", "Завершено", counts.done],
              ] as const).map(([id, label, n]) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                    <span
                      className={`tnum rounded-full px-1 text-[10px] ${
                        active ? "bg-primary-foreground/20" : "bg-muted"
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {tab === "todo" ? (
            todoBuckets.length === 0 ? (
              <EmptyVictory
                title={`На сегодня всё выполнено — ${counts.done}/${counts.done || 1}. Отличная смена.`}
                next="завтра 09:30 · дневная планёрка"
                hint="Проверьте «Жду» и «На контроле» — если там пусто, можно выдохнуть."
                action={{ label: "Посмотреть неделю", to: "/gpr" }}
              />
            ) : (
              <div className="divide-y divide-border/60">
                {todoBuckets.map((g) => (
                  <div key={g.bucket}>
                    <div className="flex items-center justify-between bg-muted/40 px-4 py-1.5">
                      <BucketLabel b={g.bucket} />
                      <span className="tnum text-[10px] font-bold text-muted-foreground">
                        {g.items.length}
                      </span>
                    </div>
                    <ul className="divide-y divide-border/60">
                      {g.items.map((w) => (
                        <WorkRow
                          key={w.id}
                          w={w}
                          onOpen={() => setSheet(w)}
                          onComplete={() => complete(w)}
                          onPostpone={(u) => postpone(w, u)}
                          onDelegate={() => delegate(w)}
                          rowRef={(el) => (rowRefs.current[w.id] = el)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          ) : activeList.length === 0 ? (
            <EmptyQueue tab={tab} />
          ) : (
            <ul className="divide-y divide-border/60">
              {activeList.map((w) => (
                <WorkRow
                  key={w.id}
                  w={w}
                  onOpen={() => setSheet(w)}
                  onComplete={() => complete(w)}
                  onPostpone={(u) => postpone(w, u)}
                  onDelegate={() => delegate(w)}
                  rowRef={(el) => (rowRefs.current[w.id] = el)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* СИТУАЦИЯ */}
        <aside className="space-y-4">
          {home.panels.map((p) => (
            <SidePanelCard key={p.id} panel={p} />
          ))}
        </aside>
      </div>

      {/* Side-sheet справа: детали дела */}
      {sheet && (
        <DetailsSheet
          item={sheet}
          onClose={() => setSheet(null)}
          onComplete={() => complete(sheet)}
          onPostpone={(u) => postpone(sheet, u)}
          onDelegate={() => delegate(sheet)}
        />
      )}
    </div>
  );
}

function WorkRow({
  w,
  onOpen,
  onComplete,
  onPostpone,
  onDelegate,
  rowRef,
}: {
  w: WorkItem;
  onOpen: () => void;
  onComplete: () => void;
  onPostpone: (until: "tomorrow" | "friday") => void;
  onDelegate: () => void;
  rowRef?: (el: HTMLButtonElement | null) => void;
}) {
  const dueTone =
    w.bucket === "overdue" || w.critical
      ? "text-destructive"
      : "text-muted-foreground";
  const isDone = w.state === "done";
  const isUrgent = !isDone && (w.bucket === "blocks" || w.bucket === "overdue" || w.critical);
  return (
    <li>
      <div
        className={`group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40 ${
          isUrgent ? "pulse-urgent" : ""
        }`}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Открыть детали: ${w.verb}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:bg-brand-soft group-hover:text-accent-foreground"
        >
          <CategoryIcon c={w.category} />
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 text-left"
        >
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <span>{w.category}</span>
            {w.object && (
              <span className="tnum rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                {w.object}
              </span>
            )}
            <span className={`tnum ${dueTone}`}>· {w.due}</span>
            {w.amount && (
              <span className="tnum text-accent-foreground">· {w.amount}</span>
            )}
          </div>
          <div className={`truncate text-sm font-bold ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>{w.verb}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {w.context} · <span className="italic">{w.reason}</span>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {w.state === "todo" ? (
            <button
              ref={rowRef}
              type="button"
              onClick={onComplete}
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {w.primary.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <Link
              to={w.primary.to}
              search={w.primary.search as never}
              className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              Открыть
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Ещё действия"
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Clock className="mr-2 h-3.5 w-3.5" />
                  Отложить
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => onPostpone("tomorrow")}>
                      До завтра
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onPostpone("friday")}>
                      До пятницы
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onSelect={onDelegate}>
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                Делегировать
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onOpen}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                Открыть детали
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </li>
  );
}

function EmptyQueue({ tab }: { tab?: WorkState }) {
  const messages: Record<WorkState, string> = {
    todo: "Дел нет — можно выдохнуть. Проверьте «Жду» и «На контроле».",
    waiting: "Никого не ждём — очередь пуста.",
    watching: "Ничего не держим на контроле.",
    done: "Пока ничего не завершено сегодня.",
  };
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
      <CheckCircle2 className="h-6 w-6 text-success" />
      <p className="text-sm font-bold">Пусто</p>
      <p className="text-xs text-muted-foreground">
        {tab ? messages[tab] : messages.todo}
      </p>
    </div>
  );
}

function SidePanelCard({ panel }: { panel: SidePanel }) {
  const toneBg =
    panel.tone === "critical"
      ? "bg-destructive/10 text-destructive"
      : panel.tone === "warn"
        ? "bg-accent/20 text-accent-foreground"
        : panel.tone === "accent"
          ? "bg-brand-soft text-accent-foreground"
          : "bg-muted text-muted-foreground";
  const Icon = panel.icon;
  return (
    <section className="card-soft overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${toneBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-extrabold leading-tight">{panel.title}</h2>
          {panel.subtitle && (
            <p className="truncate text-[11px] text-muted-foreground">{panel.subtitle}</p>
          )}
        </div>
      </div>
      <ul className="divide-y divide-border/60">
        {panel.items.map((it) => {
          const rightTone =
            it.tone === "critical"
              ? "text-destructive"
              : it.tone === "warn"
                ? "text-accent-foreground"
                : it.tone === "ok"
                  ? "text-success"
                  : "text-muted-foreground";
          const dotTone =
            it.tone === "critical"
              ? "bg-destructive"
              : it.tone === "warn"
                ? "bg-accent"
                : it.tone === "ok"
                  ? "bg-success"
                  : "bg-muted-foreground/40";
          const body = (
            <div className="flex items-start gap-3 px-4 py-2.5">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotTone}`} aria-hidden />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[13px] font-bold text-foreground">{it.title}</div>
                {it.detail && (
                  <div className="truncate text-[11px] text-muted-foreground">{it.detail}</div>
                )}
              </div>
              {it.right && (
                <span className={`tnum shrink-0 text-[11px] font-bold ${rightTone}`}>
                  {it.right}
                </span>
              )}
              {it.to && (
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
            </div>
          );
          return (
            <li key={it.id}>
              {it.to ? (
                <Link to={it.to} className="block transition-colors hover:bg-muted/50">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DetailsSheet({
  item,
  onClose,
  onComplete,
  onPostpone,
  onDelegate,
}: {
  item: WorkItem;
  onClose: () => void;
  onComplete: () => void;
  onPostpone: (until: "tomorrow" | "friday") => void;
  onDelegate: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Детали: ${item.verb}`}
      className="fixed inset-0 z-40 flex"
    >
      <button
        aria-label="Закрыть панель деталей"
        onClick={onClose}
        className="flex-1 bg-background/60 backdrop-blur-sm"
      />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-page-in">
        <header className="flex items-start gap-3 border-b border-border/60 px-5 py-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
            <CategoryIcon c={item.category} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {item.category}
              {item.object && <> · {item.object}</>}
            </div>
            <h2 className="mt-0.5 text-base font-extrabold leading-tight">{item.verb}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{item.context}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-auto px-5 py-4 text-sm">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Срок
            </div>
            <div className="tnum mt-1 font-bold text-foreground">{item.due}</div>
          </div>
          {item.amount && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Сумма / влияние
              </div>
              <div className="tnum mt-1 font-bold text-accent-foreground">{item.amount}</div>
            </div>
          )}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Почему приоритет
            </div>
            <p className="mt-1 leading-snug text-foreground">{item.reason}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Источник
            </div>
            <p className="mt-1 leading-snug text-muted-foreground">{item.source}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              История
            </div>
            <ol className="mt-2 space-y-2 border-l border-border pl-4">
              <li>
                <div className="tnum text-[10px] text-muted-foreground">14.07 · 09:12</div>
                <div className="text-[12px] font-semibold">Задача поступила в очередь</div>
              </li>
              <li>
                <div className="tnum text-[10px] text-muted-foreground">14.07 · 10:04</div>
                <div className="text-[12px] font-semibold">Прикреплены документы (3)</div>
              </li>
              <li>
                <div className="tnum text-[10px] text-muted-foreground">сейчас</div>
                <div className="text-[12px] font-semibold text-foreground">
                  Ожидает вашего решения
                </div>
              </li>
            </ol>
          </div>
        </div>
        <footer className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-5 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground">
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              Отложить
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => onPostpone("tomorrow")}>
                До завтра
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onPostpone("friday")}>
                До пятницы
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={onDelegate}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground"
          >
            Делегировать
          </button>
          <Link
            to={item.primary.to}
            search={item.primary.search as never}
            className="ml-auto rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-muted-foreground hover:text-primary"
          >
            Открыть в модуле
          </Link>
          <button
            type="button"
            onClick={onComplete}
            disabled={item.state !== "todo"}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {item.primary.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </footer>
      </aside>
    </div>
  );
}
