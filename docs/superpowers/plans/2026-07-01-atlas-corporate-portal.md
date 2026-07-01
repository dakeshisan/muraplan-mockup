# ATLAS · корпоративный портал на месте index.html — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Коммиты — НЕ автоматически.** По hard rule PM (`~/.claude/CLAUDE.md`): «Коммит и push — ТОЛЬКО по моей явной просьбе». Не коммитить после каждой задачи. Единственный коммит — в конце (Task 5), и только после того, как PM явно подтвердил, что можно коммитить.

**Goal:** Превратить `index.html` (корень atlas.atamuragroup.kz) в корпоративный портал (приветствие, «на вас ждёт», новости+KPI, быстрые ссылки, орг-справочник); перенести прежнее содержимое «вход по роли» без изменений на новый `role.html`.

**Architecture:** Два статических HTML-файла в корне репозитория, без бэкенда. `role.html` — точная копия текущего `index.html`. Новый `index.html` переиспользует те же дизайн-токены/рейл/KPI-fetch-скрипt, что и оригинал, но с новым `<main>`.

**Tech Stack:** Статический HTML/CSS/vanilla JS (без сборки), GitHub Pages. Тот же движок данных `gpr-engine/gpr_data.json`, что уже используется.

---

## Проверка вместо unit-тестов

В этом репозитории нет тестового фреймворка для HTML-мокапов (весь ATLAS — статические файлы). Установленный в проекте способ проверки (см. `docs/spec-atlas-corporate-portal.md` и историю правок ATLAS): `node --check` на встроенный `<script>`, ручной просмотр в браузере (консоль чистая, вёрстка не съезжает на ~720px), и adversarial-критик перед тем, как считать готовым. Каждая задача ниже использует эту проверку вместо pytest/jest.

## Файловая структура

- **Create:** `role.html` — байт-в-байт копия текущего `index.html` (до любых правок).
- **Modify:** `index.html` — новый `<title>`, новый `<main>` (портал), обновлённый `<style>` (убраны неиспользуемые правила `.hero`/`.feature`/`.roles`/`.role-card`/`.sysgrid`/`.sys`/`.lbl`/`.creed`, добавлены правила для `.greet`/`.taskcard`/`.news`/`.linkgrid`/`.orgcard`). `<aside class="nav">` и fetch-скрипт KPI переносятся без изменений логики.

---

### Task 1: Снимок текущего index.html → role.html

**Files:**
- Create: `role.html`

- [ ] **Step 1: Скопировать файл без изменений**

```bash
cd ~/Documents/AI/muraplan-mockup
cp index.html role.html
```

- [ ] **Step 2: Проверить, что копия идентична источнику**

Run: `diff index.html role.html`
Expected: пустой вывод (файлы идентичны)

- [ ] **Step 3: Открыть role.html в браузере, убедиться что страница работает как прежний index.html**

Через `preview_start`/локальный статический сервер открыть `role.html` — должен показать герой ATLAS + «Войти по роли» + карточки ролей + «Карта системы» + плашку-девиз, без визуальных отличий от текущего живого `index.html`. Консоль без ошибок.

Пока `<title>` и содержимое не меняются — это осознанно (Task 1 фиксирует «снимок до»), правки `<title>` не требуется.

---

### Task 2: Новый index.html — портал

**Files:**
- Modify: `index.html` (полная замена `<style>` внутри блока портальных правил + полная замена `<body>`/`<main>`)

- [ ] **Step 1: Заменить `<title>`**

Было:
```html
<title>ATLAS · строительная ERP · вход по роли</title>
```
Стало:
```html
<title>ATLAS · корпоративный портал</title>
```

- [ ] **Step 2: В `:root` добавить недостающие токены (используются в других экранах ATLAS, напр. `dashboard.html`, но отсутствуют в текущем `index.html`)**

Найти блок `:root{...}` и добавить после строки `--good:#1f7a4d; --bad:#b5482e; --bad-soft:#f6e6e0;`:

```css
    --amber:#c2862a; --amber-soft:#f6ecd6;
```

- [ ] **Step 3: Удалить неиспользуемые CSS-правила**

Удалить целиком блоки правил для (они переехали в `role.html` и на портале не нужны): `.hero` и всё внутри (`.hero .word`, `.hero .word .g`, `.hero .sub`, `.hero .lead`, `.hero .lead b`), `.snap .pill.alarm` и `.snap .pill.alarm b` можно оставить (переиспользуются в KPI-блоке), `.lbl` и вложенные, `.feature` и всё вложенное (`.feature::after`, `.feature .role`, `.feature .role .ic`, `.feature h3`, `.feature p`, `.feature .main-col`, `.feature .side`, `.feature .note`, `.feature .note svg`, `.feature:hover .btn-gold svg`), `.btn-gold` и `.btn-gold:hover`/`.btn-gold svg` (не используется на портале), `.roles`, `.role-card` и всё вложенное, `.sysgrid`, `.sys` и всё вложенное, `.creed` и всё вложенное, `@keyframes pulse-dot` можно оставить (используется `.stamp-chip .dot`, переносится).

Оставить как есть: `:root`, base-стили (`*`, `html`, `body`, `body::before`, `h1,h2,h3...`, `a`, `button`, `:focus-visible`, `.tnum`), `.shell`, `aside.nav` и всё вложенное, `main{...}`, `header.top` и всё вложенное (`.eyebrow`, `.top-meta`, `.stamp-chip*`, `.group-chip*`), `.snap` и `.snap .pill` (без `.alarm`-варианта тоже оставить — используется), `.card`, `.reveal`/`@keyframes rise`, медиа-запросы (но почистить в них ссылки на удалённые классы — см. Step 5).

- [ ] **Step 4: Добавить новые CSS-правила для портала**

Вставить перед `/* ===== responsive ===== */`:

```css
  /* ===== PORTAL: greeting ===== */
  .greet{margin-top:clamp(20px,3vw,32px);display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px}
  .greet .brandline{font-family:'Cormorant','EB Garamond',Georgia,serif;font-weight:600;font-style:italic;font-size:15px;color:var(--gold-ink);letter-spacing:.04em;text-transform:uppercase}
  .greet .brandline .g{color:var(--gold-deep)}
  .greet h1{font-family:'Cormorant','EB Garamond',Georgia,serif;font-style:italic;font-weight:600;font-size:clamp(30px,4vw,44px);color:var(--navy);margin-top:4px}
  .greet .sub{font-size:13px;color:var(--muted);margin-top:4px}
  .greet .today{font-size:12px;color:var(--muted);text-align:right}

  /* ===== PORTAL: cards shared ===== */
  .pcard{padding:22px clamp(20px,2.4vw,30px)}
  .pcard h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600;margin-bottom:14px}

  /* ===== PORTAL: task list (На вас ждёт) ===== */
  .task{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid var(--line)}
  .task:first-of-type{border-top:none}
  .task .dot2{width:9px;height:9px;border-radius:50%;flex:none}
  .task .dot2.bad{background:var(--bad)}
  .task .dot2.amber{background:var(--amber)}
  .task .dot2.good{background:var(--good)}
  .task .tx{flex:1;min-width:0}
  .task .tx b{display:block;font-size:13.5px;color:var(--ink);font-weight:600}
  .task .tx span{font-size:12px;color:var(--muted)}
  .task a{font-size:12px;color:var(--teal-600);font-weight:600;white-space:nowrap}

  /* ===== PORTAL: news + kpi row ===== */
  .row2{display:flex;gap:18px;align-items:stretch;flex-wrap:wrap;margin-top:18px}
  .row2>*{flex:1;min-width:280px}
  .news .item{padding:12px 0;border-top:1px solid var(--line)}
  .news .item:first-child{border-top:none}
  .news .item .meta{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--gold-ink)}
  .news .item h4{font-size:15px;color:var(--navy);margin:5px 0 4px}
  .news .item p{font-size:12.5px;color:var(--muted);line-height:1.5}
  .news .item a{font-size:12px;color:var(--teal-600);font-weight:600;display:inline-block;margin-top:5px}
  .news .item span.nolink{font-size:12px;color:var(--muted-soft);font-weight:600;display:inline-block;margin-top:5px}
  .kpi-col .snap{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:0}

  /* ===== PORTAL: quick links ===== */
  .linkgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:2px}
  .linkgrid a{background:var(--teal-tint);border-radius:var(--r-md);padding:14px 10px;text-align:center;font-size:12.5px;font-weight:600;color:var(--teal-600);transition:transform .18s var(--ease)}
  .linkgrid a:hover{transform:translateY(-2px)}
  .linkgrid a.cta{background:linear-gradient(150deg,var(--gold),var(--gold-deep));color:var(--navy-900)}

  /* ===== PORTAL: org info ===== */
  .orgcard{padding:16px clamp(20px,2.4vw,30px)}
  .orgtoggle{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:var(--navy);width:100%;justify-content:space-between}
  .orgtoggle .chev{transition:transform .2s var(--ease);color:var(--muted);display:inline-block}
  .orgtoggle[aria-expanded="true"] .chev{transform:rotate(180deg)}
  .orglist{margin-top:14px;padding-top:14px;border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .orglist .grp b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--gold-ink);margin-bottom:8px}
  .orglist .grp ul{list-style:none;display:flex;flex-direction:column;gap:5px}
  .orglist .grp li{font-size:12.5px;color:var(--muted)}
```

- [ ] **Step 5: Обновить медиа-запросы**

Найти блок `@media (max-width:1180px){.roles{grid-template-columns:repeat(2,1fr)}.sysgrid{grid-template-columns:repeat(2,1fr)}}` — заменить на:

```css
  @media (max-width:1180px){.linkgrid{grid-template-columns:repeat(3,1fr)}}
```

Найти `@media (max-width:900px){.feature{grid-template-columns:1fr}.feature .side{margin-top:6px}}` — удалить целиком (класс `.feature` удалён).

В блоке `@media (max-width:720px){...}` удалить строки `.roles{grid-template-columns:1fr}.sysgrid{grid-template-columns:1fr}` и `.creed{flex-direction:column;text-align:center;gap:12px}.creed .mk{display:none}`, добавить вместо них:

```css
    .row2{flex-direction:column}
    .linkgrid{grid-template-columns:repeat(2,1fr)}
    .orglist{grid-template-columns:1fr}
```

- [ ] **Step 6: Заменить `<body>` — убрать старый hero/roles/sysgrid/creed, вставить портал**

Найти в файле точный диапазон от строки `<!-- HERO -->` до строк `  </main>\n</div>` **включительно** (то есть весь блок hero + role entry + system map + creed footer, ПЛЮС закрывающие `</main>` и `</div>` шелла, которые в оригинале идут сразу после `</footer>`) и заменить целиком на блок ниже. Блок ниже уже содержит свои собственные закрывающие `</main>` и `</div>` в конце — не оставляйте старые закрывающие теги, замена должна быть 1:1 (там, где было `...</footer>\n\n  </main>\n</div>`, станет `...<div class="grp">...</div>\n    </div>\n\n  </main>\n</div>` из блока ниже).

```html
    <!-- GREETING -->
    <section class="greet reveal" style="animation-delay:.1s">
      <div>
        <div class="brandline">ATL<span class="g">A</span>S</div>
        <h1>С возвращением</h1>
        <p class="sub">ATLAS · корпоративный портал ATAMŪRA</p>
      </div>
      <div class="today" id="today"></div>
    </section>

    <!-- НА ВАС ЖДЁТ -->
    <div class="card pcard reveal" style="animation-delay:.16s">
      <h3>На вас ждёт</h3>
      <div class="task">
        <span class="dot2 bad"></span>
        <span class="tx"><b>3 акта КС-2 на согласование</b><span>Атмосфера, участок 5 — от инженера ПТО</span></span>
        <a href="docs.html">Открыть →</a>
      </div>
      <div class="task">
        <span class="dot2 amber"></span>
        <span class="tx"><b>1 просроченный фронт ГПР</b><span>Аура, каркас — отставание 6 дней</span></span>
        <a href="gpr.html?zk=aura">В ГПР →</a>
      </div>
      <div class="task">
        <span class="dot2 good"></span>
        <span class="tx"><b>2 заявки на закуп ждут визы</b><span>Керуен — арматура, кабель-канал</span></span>
        <a href="snab.html#zakup">В снабжение →</a>
      </div>
    </div>

    <!-- НОВОСТИ + KPI -->
    <div class="row2 reveal" style="animation-delay:.22s">
      <div class="card pcard">
        <h3>Новости и объявления</h3>
        <div class="news">
          <div class="item">
            <div class="meta">Снабжение · 27 июня</div>
            <h4>Новый поставщик арматуры прошёл проверку СБ</h4>
            <p>Цена на 4% ниже текущего прайса, договор на подписи.</p>
            <a href="atlas_supply_roles_brand.html">Читать →</a>
          </div>
          <div class="item">
            <div class="meta">Атмосфера · 28 июня</div>
            <h4>Срыт до фундаментной плиты пятно 6</h4>
            <p>Начало каркасных работ смещено на неделю раньше графика.</p>
            <a href="gpr.html?zk=atmo">Читать →</a>
          </div>
          <div class="item">
            <div class="meta">Академия · 30 июня</div>
            <h4>Модуль M6 «Работа с возражениями» открыт для ТМ</h4>
            <p>Проходят 42 из 58 менеджеров, средний балл 81%.</p>
            <span class="nolink">Демо-запись, без перехода</span>
          </div>
        </div>
      </div>
      <div class="kpi-col">
        <div class="card pcard" style="height:100%">
          <h3>KPI-снапшот</h3>
          <div class="snap" id="snap">
            <div class="pill"><b class="tnum">4</b><span>жилых комплекса</span></div>
            <div class="pill"><b class="tnum">36</b><span>блоков</span></div>
            <div class="pill"><b class="tnum">1&nbsp;322</b><span>работ в плане</span></div>
            <div class="pill alarm"><b class="tnum">666</b><span>работ не в срок</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- БЫСТРЫЕ ССЫЛКИ -->
    <div class="card pcard reveal" style="animation-delay:.28s">
      <h3>Быстрые ссылки</h3>
      <div class="linkgrid">
        <a href="gpr.html">ГПР</a>
        <a href="atlas_supply_roles_brand.html">Снабжение</a>
        <a href="finance.html">Финансы</a>
        <a href="docs.html">Документы</a>
        <a href="league.html">Лига</a>
        <a href="role.html" class="cta">Войти по роли →</a>
      </div>
    </div>

    <!-- ОРГ-ИНФО -->
    <div class="card orgcard reveal" style="animation-delay:.34s">
      <button class="orgtoggle" id="orgToggle" aria-expanded="false" aria-controls="orgList">
        <span>9 ЖК · 18 подразделений</span>
        <span class="chev">▾</span>
      </button>
      <div class="orglist" id="orgList" hidden>
        <div class="grp">
          <b>Совет управляющих</b>
          <ul><li>Совет Управляющих</li><li>AI департамент</li><li>Новые проекты</li><li>Финансы</li></ul>
        </div>
        <div class="grp">
          <b>Коммерческий блок</b>
          <ul><li>Департамент продаж</li><li>Департамент маркетинга</li></ul>
        </div>
        <div class="grp">
          <b>Без блока</b>
          <ul><li>Департамент строительства</li><li>ATAMŪRA Комфорт</li><li>Департамент механизмов</li><li>Департамент снабжения и хранения</li><li>Департамент безопасности</li><li>Проектный департамент</li><li>GR</li><li>Департамент HR</li><li>Бухгалтерия</li><li>Юридический</li><li>Тех.совет</li></ul>
        </div>
      </div>
    </div>

  </main>
</div>
```

(Обратите внимание: `</main></div>` в конце — это те же закрывающие теги, что были в оригинале сразу после `</footer>`, просто теперь main закрывается сразу после `.orgcard`.)

- [ ] **Step 7: Заменить `<script>` в конце файла**

Было (весь блок `<script>...</script>` перед `</body>`):
```html
<script>
  const $=id=>document.getElementById(id);
  function build(D){
    const port=D.portfolio||[];
    const allBlocks=port.reduce((a,o)=>a+(o.blocks||[]).length,0);
    const allWorks=port.reduce((a,o)=>a+(o.blocks||[]).reduce((s,b)=>s+(b.works||[]).length,0),0);
    let totalLate=0;
    port.forEach(o=>(o.blocks||[]).forEach(b=>(b.works||[]).forEach(w=>{if((w.lag||0)>0)totalLate++;})));
    return {objects:port.length,allBlocks,allWorks,totalLate};
  }
  function render(M){
    const n=x=>x.toLocaleString('ru');
    $('snap').innerHTML=[
      {v:M.objects,k:'жилых комплекса'},
      {v:M.allBlocks,k:'блоков'},
      {v:M.allWorks,k:'работ в плане'},
      {v:M.totalLate,k:'работ не в срок',alarm:true},
    ].map(p=>`<div class="pill${p.alarm?' alarm':''}"><b class="tnum">${n(p.v)}</b><span>${p.k}</span></div>`).join('');
  }
  fetch('gpr-engine/gpr_data.json',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw 0;return r.json();})
    .then(D=>{
      const d=(D.status_date||'2026-05-28').split('-').reverse().join('.');
      $('stamp').textContent=d;
      render(build(D));
    })
    .catch(()=>{/* keep static prefilled snapshot */});
</script>
```

Стало (KPI fetch-логика 1:1 сохранена, добавлены дата и toggle справочника):
```html
<script>
  const $=id=>document.getElementById(id);
  function build(D){
    const port=D.portfolio||[];
    const allBlocks=port.reduce((a,o)=>a+(o.blocks||[]).length,0);
    const allWorks=port.reduce((a,o)=>a+(o.blocks||[]).reduce((s,b)=>s+(b.works||[]).length,0),0);
    let totalLate=0;
    port.forEach(o=>(o.blocks||[]).forEach(b=>(b.works||[]).forEach(w=>{if((w.lag||0)>0)totalLate++;})));
    return {objects:port.length,allBlocks,allWorks,totalLate};
  }
  function render(M){
    const n=x=>x.toLocaleString('ru');
    $('snap').innerHTML=[
      {v:M.objects,k:'жилых комплекса'},
      {v:M.allBlocks,k:'блоков'},
      {v:M.allWorks,k:'работ в плане'},
      {v:M.totalLate,k:'работ не в срок',alarm:true},
    ].map(p=>`<div class="pill${p.alarm?' alarm':''}"><b class="tnum">${n(p.v)}</b><span>${p.k}</span></div>`).join('');
  }
  fetch('gpr-engine/gpr_data.json',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw 0;return r.json();})
    .then(D=>{
      const d=(D.status_date||'2026-05-28').split('-').reverse().join('.');
      $('stamp').textContent=d;
      render(build(D));
    })
    .catch(()=>{/* keep static prefilled snapshot */});

  $('today').textContent=new Date().toLocaleDateString('ru',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  const orgToggle=$('orgToggle'), orgList=$('orgList');
  orgToggle.addEventListener('click',()=>{
    const open=orgToggle.getAttribute('aria-expanded')==='true';
    orgToggle.setAttribute('aria-expanded',String(!open));
    orgList.hidden=open;
  });
</script>
```

- [ ] **Step 8: Проверить синтаксис встроенного JS**

Скопировать содержимое финального `<script>` в отдельный временный файл и прогнать `node --check`:

```bash
cd ~/Documents/AI/muraplan-mockup
python3 -c "
import re
html = open('index.html').read()
m = re.findall(r'<script>(.*?)</script>', html, re.S)
open('/tmp/atlas_portal_check.js','w').write(m[-1])
"
node --check /tmp/atlas_portal_check.js
```

Expected: без вывода (синтаксис ок). Затем удалить временный файл: `rm /tmp/atlas_portal_check.js`

---

### Task 3: Браузер-проверка обеих страниц

**Files:** нет изменений, только проверка `index.html` и `role.html`

- [ ] **Step 1: Поднять локальный статический сервер и открыть index.html**

Через `preview_start` (или `python3 -m http.server` в папке репозитория) открыть `index.html`. Проверить:
- рейл слева на месте, пункт «Вход» подсвечен активным, ведёт на `index.html`
- приветствие «С возвращением» + дата сегодня отображается
- «На вас ждёт» — 3 строки с ссылками, все 3 ссылки некликабельно не ломаются (docs.html, gpr.html?zk=aura, snab.html#zakup — существующие файлы)
- новости+KPI в ряд, KPI-цифры подтянулись из `gpr-engine/gpr_data.json` (не статичные 4/36/1322/666, а актуальный срез, если данные отличаются)
- быстрые ссылки — все 6 плиток кликабельны, ссылка «Войти по роли →» ведёт на `role.html`
- клик по «9 ЖК · 18 подразделений» разворачивает список 3 колонками, повторный клик сворачивает
- консоль браузера чистая (`preview_console_logs`, level=error/warn — пусто)

- [ ] **Step 2: Проверить адаптивную вёрстку**

`preview_resize` на ширину ~720px и ~375px — `.row2` должен схлопнуться в колонку, `.linkgrid` — 2 колонки, `.orglist` — 1 колонка, рейл — узкий вариант (как на остальных экранах ATLAS). Ничего не должно вылезать за пределы экрана.

- [ ] **Step 3: Открыть role.html, убедиться что это прежний «вход по роли» без изменений**

Сверить визуально с тем, как выглядел `index.html` до правок (Task 1 — снимок). Все 7 карточек ролей, «Карта системы», плашка-девиз — на месте, ссылки рабочие, рейл на месте (первый пункт «Вход», но теперь ведёт на портал — это ожидаемо).

---

### Task 4: Adversarial-критика (обязательна — правило PM для правок дизайн-документов/архитектуры)

- [ ] **Step 1: Запустить independent Critic-агента**

Через `Agent` tool (общий, не завязанный на текущий контекст диалога) с ролью «архитектурный/UX критик ATLAS»: дать полный текст `docs/spec-atlas-corporate-portal.md`, итоговый `index.html` и `role.html`, попросить найти слабые места — не подтверждать, а искать: (а) битые/нелогичные ссылки в «На вас ждёт» и новостях, (б) визуальные нестыковки после удаления CSS (неопределённые классы, осиротевшие стили), (в) доступность (aria на toggle, контраст текста по токенам `--muted`/`--gold-ink` на светлом фоне), (г) смысловые дыры (не хватает какого-то блока из спеки, дублирование с role.html).

- [ ] **Step 2: Применить обоснованные замечания**

Внести правки в `index.html`/`role.html` по итогам критики. Если критик не даёт new SHIP-blocking замечаний — зафиксировать вердикт (SHIP / SHIP-with-fixes) в сообщении PM.

---

### Task 5: Коммит (только после явного «да» от PM)

- [ ] **Step 1: Показать PM итоговый diff и спросить подтверждение**

```bash
cd ~/Documents/AI/muraplan-mockup
git status
git diff -- index.html
```

Спросить PM: «Готово, закоммитить `index.html` (портал) + `role.html` (новый вход по роли)?» — коммитить только после явного «да».

- [ ] **Step 2: Закоммитить (после подтверждения PM)**

```bash
cd ~/Documents/AI/muraplan-mockup
git add index.html role.html
git commit -m "ATLAS: корпоративный портал на index.html, вход по роли → role.html"
```

- [ ] **Step 3: Спросить PM отдельно, нужен ли push / выкладка на живой домен**

Пуш в `origin/main` (и, соответственно, публикация на atlas.atamuragroup.kz через GitHub Pages) — тоже отдельное явное решение PM, не автоматическое продолжение коммита.

---

## Приёмка (сверка со спекой)

- [ ] `index.html` открывается и показывает портал по всем 5 блокам из спеки (приветствие, «на вас ждёт», новости+KPI, быстрые ссылки, орг-инфо)
- [ ] KPI берутся живым fetch из `gpr-engine/gpr_data.json`, логика не менялась
- [ ] `role.html` — 1:1 старый `index.html` (герой+роли+карта системы+девиз)
- [ ] Рейл на всех 21 экранах не тронут, «Вход» по-прежнему ведёт на `index.html`
- [ ] «Войти по роли →» с портала ведёт на `role.html`; ссылки «На вас ждёт» ведут на существующие экраны
- [ ] Консоль чистая, `node --check` проходит, адаптив ок на ~720px/375px
- [ ] Adversarial-критика пройдена (SHIP / SHIP-with-fixes)
- [ ] Коммит — только после явного подтверждения PM; push/деплой — отдельное явное решение
