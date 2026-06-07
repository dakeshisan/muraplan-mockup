# Bitrix24 sp178 — контракт интеграции (Муравей → заявки в CRM)

Проверено по офиц. докам (apidocs.bitrix24). Реализация — `supply_core/bitrix.py`.
Секрет (вебхук) — в `supply_core/.env` (gitignored), в репо/чат/лог не попадает.

## Методы (smart-process, universal `crm.item.*`)
| Метод | Тело | Ответ |
|---|---|---|
| `crm.item.add` | `{entityTypeId, fields:{title,…}}` | `result.item.id` (int) |
| `crm.item.list` | `{entityTypeId, select, filter, order, start}` | `result.items[]` + top-level `total`,`next` |
| `crm.item.get` | `{entityTypeId, id, useOriginalUfNames:"N"}` | `result.item` |
| `crm.item.update` | `{entityTypeId, id, fields:{…}}` | `result.item` |
| `crm.item.delete` | `{entityTypeId, id}` | `result:[]` (пустой массив = успех!) |
| `crm.item.fields` | `{entityTypeId, useOriginalUfNames:"N"}` | `result.fields{code:{type,isRequired,…}}` |
| `crm.type.list` | — | `result.types[].entityTypeId` (проверка id) |

- Авторизация — в URL-пути вебхука, НЕ в теле. `entityTypeId` — top-level, не в `fields`.
- Поля — camelCase `ufCrm…` (НЕ `UF_CRM_…`); коды берём **verbatim из `crm.item.fields`**, не угадываем.
- **Тихий дроп:** неизвестное/неверного регистра поле молча игнорируется (item создан, значение
  пропало, ошибки нет) → после записи читаем `crm.item.get` и проверяем (`verify_written`).
- **Обязательные поля** (`isRequired && !isReadOnly`) — без них `add` падает (в отличие от тихого дропа).
- Ошибки в ДВУХ каналах: тело `{error,error_description}` И HTTP-код. Ретрай только на `503/QUERY_LIMIT_EXCEEDED`.
- Форматы: date `YYYY-MM-DD`; datetime — ISO-8601 **со смещением** `+05:00`; enum = числовой ID опции;
  multiple = массив; money `"300|KZT"`; bool `"Y"/"N"`.
- URL карточки: `{portal}/crm/type/{entityTypeId}/details/{id}/` · канбан `…/kanban/category/{categoryId}/`.

## Безопасность записи
`live=False` по умолчанию → ничего не пишем (сидинг/демо/веб-UI остаются dry). Запись (`add/delete`)
только при явном `live=True` (CLI/endpoint), после probe и подтверждения. Без вебхука — всегда dry.

## Runbook go-live (когда вебхук в .env)
1. **`python3 -m supply_core.bitrix probe`** (read-only):
   - `crm.type.list` → ПОДТВЕРДИТЬ entityTypeId «заявок» (может быть НЕ 178!) → при расхождении `BITRIX_SP` в .env;
   - `crm.item.fields` → точные коды `ufCrm…`, типы, **обязательные** поля, enum-опции (ID).
2. **`push-test --live`** → одна `[ТЕСТ ATLAS] …` заявка → read-back title → ссылка на карточку.
3. Составить `field_map`: work_uid→ufCrm…, need→date, plot/abc→enum(option ID), lead→int, mat/qty→string;
   stage — через `crm.status.list ENTITY_ID=DYNAMIC_178_STAGE_{cat}` (не голое «req»).
4. Массовая выгрузка — `batch` (≤50 cmd/запрос, halt=0, проверять `result_error`), темп ≤2 req/сек.
5. `delete <id> --live` — снять тест/откатить.

## must-verify-live (нельзя угадать — только с портала)
- [ ] entityTypeId «заявок» (`crm.type.list`) — реально ли 178.
- [ ] Коды `ufCrm…` для work_uid / need_date / plot / abc / lead / material / qty.
- [ ] Какие поля обязательны на add (минимальный валидный payload).
- [ ] Тип каждого поля + isMultiple (формат значения).
- [ ] Числовые option-ID для enum (abc, plot).
- [ ] category/stage: `crm.category.list(178)` + `crm.status.list` (DT178_{cat}:CODE).
- [ ] Вебхук имеет scope `crm` и доступ к sp178 (smoke: `crm.item.fields`).
- [ ] portal_base и что `/crm/type/178/details/{id}/` открывает карточку.
- [ ] Round-trip: add → get → все поля непустые, datetime не сдвинут.
