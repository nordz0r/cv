# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-07-24
- Primary product surfaces: одностраничное интерактивное резюме на русском и английском языках; экранная и печатная/PDF-версии.
- Evidence reviewed: `README.md`, `index.html`, `style.css`, `script.js`, `i18n.js`, пользовательский CI/CD reference `/mnt/c/Users/Legion/AppData/Local/Temp/tmp5338.png`, публичный Performance Review BIA за 01.05.2025–30.06.2026, профили компаний в Habr Career, [Read.cv living-resume pattern](https://www.hackdesign.org/toolkit/read-cv/), [developer portfolio examples](https://roadmap.sh/frontend/web-developer-portfolio) и рекомендации по быстрому recruiter scan из [Job Search Guide](https://newsletter.jobsearch.guide/p/how-recruiters-read-your-resume).

## Brand
- Personality: уверенный senior DevOps/MLOps-инженер; технический, спокойный, точный, современный.
- Trust signals: конкретные технологии и результаты, хронология опыта, прямые контакты, сдержанная анимация, высокая читаемость.
- Avoid: мелкий текст, dashboard/card-мозаика, декоративная перегрузка, несколько конкурирующих макетов, агрессивная бесконечная анимация, презентационный вид CI/CD-диаграммы.

## Product goals
- Goals: быстро показать специализацию, подтверждённый результат, технологии в контексте конкретных ролей и карьерную историю; сохранить выразительный техно-стиль при компактной длине страницы.
- Non-goals: портфолио-платформа, интерактивный dashboard, точное копирование референса, скрытие важного содержания ради компактности.
- Success signals: основной текст читается без увеличения; технологии быстро сканируются внутри опыта и не дублируются отдельной секцией; навигация быстро возвращает к любой секции; нет горизонтального overflow; PDF остаётся нейтральным и полным.

## Personas and jobs
- Primary personas: технический руководитель, engineering manager, DevOps/MLOps lead, технический рекрутер.
- User jobs: за 30–60 секунд понять профиль кандидата; проверить ключевые компетенции; быстро перейти к опыту или контактам; сохранить/распечатать резюме.
- Key contexts of use: desktop при первичном техническом просмотре, mobile по ссылке из мессенджера, печать/PDF для внутреннего согласования.

## Information architecture
- Primary navigation: О себе → Опыт → Образование; PDF; RU/EN.
- Core routes/screens: одна страница, один макет FLOW.
- Content hierarchy: имя и роль → краткий профиль → опыт с фирменными знаками и контекстным стеком → образование.

## Design principles
- Readability before density: компактность достигается сеткой, ритмом и группировкой, но не уменьшением шрифта.
- One strong background idea: крупная CI/CD infinity-схема создаёт характер, не конкурируя с резюме.
- Motion follows reading: анимация помогает войти в страницу и мягко провожает уже прочитанный блок под верхний «кат».
- Tradeoffs: декоративная CI/CD-схема менее контрастна, чем референс, чтобы сохранить читаемость; на узком mobile она скрывается.

## Visual language
- Color: тёмный графитовый фон; основной текст светлый; существующие cyan/purple акценты; CI/CD-сегменты lime, blue, amber и mauve из пользовательского референса с пониженной экранной opacity и горизонтальной mask-зоной под текстом.
- Typography: `Unbounded` для имени и заголовков, `JetBrains Mono` для основного текста; body не меньше 16px desktop и 15px mobile; H1 `clamp(38px, 5vw, 60px)`; H2 `clamp(24px, 2.4vw, 32px)` на desktop и 22px на mobile.
- Spacing/layout rhythm: контейнер до 1120px; единый FLOW; секции компактные, но с устойчивым вертикальным ритмом; About — одна редакционная колонка до 72ch.
- Shape/radius/elevation: небольшие радиусы 6–10px, тонкие границы, мягкий glass только для sticky navigation; без тяжёлых карточных теней.
- Motion: typewriter имени; медленное дыхание фоновой схемы; scroll-linked световой маршрут; плавный обратимый уход секций под верхний fade-mask.
- Imagery/iconography: крупная декоративная SVG infinity-схема CI/CD по мотивам предоставленного референса; подписи идут по собственным направляющим внутри сегментов; `aria-hidden`. Логотипы работодателей хранятся локально, используются номинативно и не являются интерактивными.

## Components
- Existing components to reuse: sticky navigation, language switcher, contact buttons, timeline, PDF export, scroll progress, i18n.
- New/changed components: один FLOW layout; `cicd-background` с выровненными по кривым stage labels; `scroll-cut`; `company-mark` и компактная `job-stack`-строка внутри релевантных записей timeline.
- Variants and states: desktop/tablet/mobile; normal/reduced-motion; hover/focus; screen/print/export.
- Token/component ownership: цветовые, типографические и motion-токены остаются в `style.css`; поведение scroll-linked эффектов — в одном `requestAnimationFrame`-цикле `script.js`.

## Accessibility
- Target standard: WCAG 2.1 AA для основного текста, навигации и интерактивных элементов.
- Keyboard/focus behavior: видимый `:focus-visible`; mobile menu закрывается по Escape; якорная навигация возвращает секцию в читаемую область.
- Contrast/readability: основное содержание всегда выше фоновой графики; фон имеет низкую opacity и локальные маски; типографика не уменьшается ради компактности.
- Screen-reader semantics: декоративный SVG `aria-hidden="true"` и `focusable="false"`; секции не получают `aria-hidden` при визуальном уходе.
- Reduced motion and sensory considerations: `prefers-reduced-motion` отключает breathing, runner, blur и scroll-exit; весь контент остаётся полностью видимым.

## Responsive behavior
- Supported breakpoints/devices: desktop ≥ 1200px, tablet 621–1199px, mobile ≤ 620px; контрольные viewport 1440×1100, 1024×900, 390×844 и 320px minimum width.
- Layout adaptations: hero из двух зон переходит в одну колонку; контекстный стек допускает перенос на несколько строк; About всегда одна колонка; CI/CD-фон уменьшается на tablet и скрывается на mobile.
- Touch/hover differences: кнопки и menu toggle не меньше 42px; строки стека остаются обычным текстом; hover не меняет геометрию.

## Interaction states
- Loading: статический HTML сразу показывает содержание; анимации являются progressive enhancement.
- Empty: не применяется — контент встроен в документ.
- Error: при недоступном `html2pdf` используется системная печать; отсутствие JS не скрывает текст.
- Success: выбранный язык визуально отмечен; PDF-кнопка временно блокируется при экспорте.
- Disabled: PDF-кнопка использует нативный `disabled` во время экспорта.
- Offline/slow network, if applicable: системные fallback-шрифты сохраняют читаемость; SVG, логотипы и основная логика локальные.

## Content voice
- Tone: профессиональный, конкретный, инженерный, без маркетинговых преувеличений.
- Terminology: DevOps/MLOps, CI/CD, IaC и названия технологий сохраняются в привычной отраслевой форме.
- Microcopy rules: короткие навигационные подписи; английская версия соответствует русской структуре; декоративные stage labels не локализуются как общеупотребимые pipeline-термины; технологии перечисляются только там, где подтверждены опытом.

## Implementation constraints
- Framework/styling system: vanilla HTML, CSS и JavaScript; без новых runtime-зависимостей.
- Design-token constraints: расширять существующие CSS variables; не вводить отдельный design-system слой.
- Performance constraints: один rAF-цикл для scroll progress, background progress и section exit; обновлять только CSS custom properties/transforms; SVG без тяжёлых blur-фильтров.
- Compatibility constraints: graceful fallback для отсутствия `backdrop-filter`; не полагаться на CSS Scroll-Driven Animations как обязательную технологию.
- Test/screenshot expectations: синтаксические проверки; Playwright smoke/e2e; visual checkpoints desktop/tablet/mobile; overflow, menu anchors, reverse scroll, reduced-motion и print/PDF.

## Content evidence
- Performance Review используется как источник формулировок для опыта BIA, но не выводится отдельным метрическим блоком.
- Технологии группируются по работодателям, чтобы навыки читались вместе с доказательством их применения.
- Supporting practices: capacity planning, DRP/runbooks, GitOps, Blue/Green, Canary, Postmortem и cross-functional delivery.

## Open questions
- Нет открытых дизайн-вопросов для текущей итерации.
