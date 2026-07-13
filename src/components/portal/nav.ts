import {
  Home,
  Radar,
  Briefcase,
  Gauge,
  GanttChartSquare,
  Trophy,
  Building2,
  HardHat,
  Package,
  FileStack,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  desc: string;
  metric: string;
  metricTone?: "default" | "success" | "danger" | "gold";
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      {
        title: "Хаб",
        url: "/",
        icon: Home,
        desc: "Главная площадь портала",
        metric: "Пульс компании",
      },
    ],
  },
  {
    label: "Дирекция",
    items: [
      {
        title: "Командный центр",
        url: "/command",
        icon: Radar,
        desc: "Вся компания на одном экране",
        metric: "7 срочных рисков",
        metricTone: "danger",
      },
      {
        title: "Портфель собственника",
        url: "/portfolio",
        icon: Briefcase,
        desc: "Стоимость и маржа портфеля",
        metric: "9 проектов · 312 млрд ₸",
        metricTone: "gold",
      },
    ],
  },
  {
    label: "Стройка",
    items: [
      {
        title: "Пульт РП",
        url: "/rp",
        icon: Gauge,
        desc: "Рабочий стол руководителя проекта",
        metric: "4 объекта в работе",
      },
      {
        title: "Полный ГПР",
        url: "/gpr",
        icon: GanttChartSquare,
        desc: "График производства работ",
        metric: "В срок 78%",
        metricTone: "success",
      },
      {
        title: "Лига участков",
        url: "/league",
        icon: Trophy,
        desc: "Рейтинг прорабов и бригад",
        metric: "Лидер: Ержан К.",
        metricTone: "gold",
      },
      {
        title: "Разбор объекта",
        url: "/object",
        icon: Building2,
        desc: "Глубокий разбор одного объекта",
        metric: "ЖК Аура · Блок 3",
      },
    ],
  },
  {
    label: "Участок",
    items: [
      {
        title: "Напарник мастера",
        url: "/foreman",
        icon: HardHat,
        desc: "Мобильный помощник прораба",
        metric: "12 задач на сегодня",
      },
    ],
  },
  {
    label: "Снабжение",
    items: [
      {
        title: "Снабжение",
        url: "/supply",
        icon: Package,
        desc: "Cockpit снабженца: заявки и фронт",
        metric: "34 открытых заявки",
        metricTone: "danger",
      },
    ],
  },
  {
    label: "ПТО",
    items: [
      {
        title: "ПТО и бартер",
        url: "/pto",
        icon: FileStack,
        desc: "Объёмы, исполнительная, бартер",
        metric: "6 актов на проверке",
      },
    ],
  },
  {
    label: "Финансы",
    items: [
      {
        title: "Финансы и акты",
        url: "/finance",
        icon: Wallet,
        desc: "Платежи, акты, кассовый разрыв",
        metric: "К оплате 218 млн ₸",
        metricTone: "gold",
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find((i) => i.url === pathname);
}

export function findGroupLabel(pathname: string): string | null {
  for (const g of navGroups) {
    if (g.items.some((i) => i.url === pathname)) return g.label;
  }
  return null;
}
