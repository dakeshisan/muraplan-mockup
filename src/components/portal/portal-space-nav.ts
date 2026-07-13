import {
  Sun,
  Newspaper,
  ListChecks,
  Users,
  Heart,
  GraduationCap,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface PortalNavItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  desc: string;
  soon?: boolean;
}

export interface PortalNavGroup {
  label: string | null;
  items: PortalNavItem[];
}

export const portalNavGroups: PortalNavGroup[] = [
  {
    label: null,
    items: [
      {
        title: "Сегодня",
        url: "/portal",
        icon: Sun,
        desc: "Что от меня ждут",
      },
    ],
  },
  {
    label: "Компания",
    items: [
      { title: "Новости", url: "/portal/news", icon: Newspaper, desc: "Внутренний журнал" },
      { title: "Люди", url: "/portal/people", icon: Users, desc: "Сотрудники ATAMURA" },
    ],
  },
  {
    label: "Работа",
    items: [
      { title: "Задачи", icon: ListChecks, desc: "Мои задачи (скоро)", soon: true },
      { title: "Оплаты", url: "/portal/payments", icon: Receipt, desc: "Заявки и статусы" },
    ],
  },
  {
    label: "Люди и знания",
    items: [
      { title: "HR", icon: Heart, desc: "Отпуск, справки (скоро)", soon: true },
      { title: "Академия", icon: GraduationCap, desc: "Обучение (скоро)", soon: true },
    ],
  },
];

export const allPortalItems = portalNavGroups.flatMap((g) => g.items);

export function findPortalItem(pathname: string): PortalNavItem | undefined {
  return allPortalItems.find((i) => i.url === pathname);
}

export function findPortalGroupLabel(pathname: string): string | null {
  for (const g of portalNavGroups) {
    if (g.items.some((i) => i.url === pathname)) return g.label;
  }
  return null;
}
