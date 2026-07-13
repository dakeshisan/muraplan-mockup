# ATLAS — точка входа для Codex

Единый корпоративный ERP-портал застройщика **ATAMŪRA GROUP** (Казахстан).
Десять экранов подразделений сведены в одно приложение с ролевым доступом.
Собрано в Lovable, зеркалировано в этот репозиторий 1-в-1 для продолжения в Codex.

## Как запустить

```bash
bun install          # уже выполнено, 401 пакет
bun run dev          # dev-сервер (Vite), http://localhost:3000
bun run build        # прод-сборка (проверена, зелёная) → .output/ (nitro)
bun run lint         # eslint
bun run format       # prettier
```

Логин демо: **любой пароль** пускает внутрь (см. `src/routes/login.tsx`).
После входа появляется выбор персоны «Кто вы сегодня?».

## Стек

- **TanStack Start v1** (file-based routing) + **React 19** SSR
- **Tailwind v4** — дизайн-токены в `src/styles.css` (oklch). Палитра **«Вариант C» Navy `#183a52` + Teal `#1aa5b8`**, светлая/тёмная темы через класс `.dark` на `<html>`
- **shadcn** (new-york, baseColor slate) — 46 компонентов в `src/components/ui/`
- **bun** (`bunfig.toml` — 24h supply-chain guard), Vite 8, nitro, lucide-react, sonner, recharts, cmdk

## Архитектура портала (`src/components/portal/`)

- `PortalShell.tsx` — обёртка: провайдеры (тема/роль/воркспейс/палитра команд/персона), гейт логина, выбор сайдбара по пространству, мобайл-прораб как отдельный layout.
- **Три пространства** (`SpaceSwitcher`): `Сегодня` · `Компания` (Портал) · `ATLAS`. Пространство выводится из pathname (`src/lib/workspace.tsx`).
- **Ролевой доступ** (`src/lib/role.tsx`): 9 персон (admin/owner/construction_dir/pm/foreman/supply/pto/finance/office) + карта `ROLE_ACCESS`. Хранится в localStorage.
- **Ось объекта** (`ObjectSelector`): all/aura/atmosfera/keruen/aksay — фильтрует реестры ATLAS.
- **Командная палитра** (`⌘K`, `CommandPalette.tsx`): шина `>команды @люди #объекты $сущности`.
- `PersonaPicker`, `AppSidebar`, `PortalSpaceSidebar`, `TopBar` (крошки + уведомления + язык), `NoAccess`, `ComingSoon`, `Logo` (navy/white по теме).

## Экраны (`src/routes/`)

| Роут | Экран | Роль |
|---|---|---|
| `/` (index) | «Сегодня» — персональная очередь действий + per-role home | все |
| `/command` | Командный центр CEO | owner/admin/construction_dir |
| `/portfolio` | Портфель собственника (ROI/маржа) | owner |
| `/rp` | Пульт РП | pm |
| `/gpr` | Полный ГПР (гантт + крит. путь + симуляция) | pm/construction_dir |
| `/object` | Разбор объекта (тепловая карта) | pm/foreman |
| `/league` | Лига участков (геймификация) | pm/foreman |
| `/foreman` | Напарник мастера (десктоп) | foreman |
| `/foreman/mobile` | Полевой мобайл прораба (оффлайн-first, свой layout) | foreman |
| `/supply` | Снабжение (cockpit + конвейер закупа) | supply |
| `/pto` | ПТО и бартер (приёмка актов) | pto |
| `/finance` | Финансы и акты (КС-2/КС-3/АВР, казначейство) | finance |
| `/portal`, `/portal/*` | Пространство «Компания»: Сегодня, Новости, Люди, Оплаты | office/все |
| `/login` | Вход (split navy→teal, Cormorant+Jost) | — |

`routeTree.gen.ts` генерируется автоматически при dev/build — в git не хранится.

## Что сейчас mock, а что нужно подключать

- **Все данные — демонстрационные** (в коде, суммы/имена вымышленные). Никаких реальных API.
- **Логин** — фейковый (localStorage `atlas.loggedIn`). TODO в `login.tsx`: заменить на `POST /api/login` (httpOnly cookie-сессия + CSRF).
- localStorage-ключи состояния: `atlas.loggedIn`, `atlas.role`, `atlas.theme`, `atlas.personaChosen`, `atlas.selectedObject`.

## Следующие шаги (предложение)

1. Подключить реальный бэкенд вместо мок-данных, начиная с канона оплат (Portal Payments) и актов (`/finance`).
2. Реализовать вход по OIDC (host-only cookie) — интеграция с корпоративным порталом **my.atamura.group**. Архитектура интеграции согласована отдельно (раздельные БД, OIDC, outbox, Portal Payments как канон платежей).
3. Центр уведомлений (сейчас колокольчик — заглушка-toast), двуязычие KK (переключатель ҚАЗ — заглушка).

## Важно

- Проект связан с Lovable (см. `AGENTS.md`): не переписывать опубликованную git-историю.
- Держать ветку в рабочем состоянии — `bun run build` должен оставаться зелёным.
