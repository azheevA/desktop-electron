# my desktop

Персональное desktop-приложение на Next.js + Electron. Управление проектами, задачами и локальным профилем.

## Стек

- Next.js 15 App Router, React 19, TypeScript
- Electron с frameless-окном и безопасным Preload/IPC
- Redux Toolkit для состояния профиля, проектов, задач и уведомлений
- FSD (Feature-Sliced Design)
- Tailwind CSS 3 и собственный UI Kit на Radix UI
- Локальное хранение всех данных в одном JSON-файле

## Запуск

Требуются Node.js 22 и Bun 1.4.5.

```bash
bun install
bun run desktop:dev
```

Для запуска только веб-версии в браузере:

```bash
bun run dev
```

В режиме разработки Next.js запускается на `http://localhost:3000`, а Electron открывает отдельное окно.

## Сборка Windows

```bash
bun run desktop:dist:win
```

Установщик появится в `release/`.

## Хранение данных

В Electron приложение сохраняет профиль, проекты, задачи и уведомления в один файл `workspace.json` внутри системной папки Electron `app.getPath("userData")`.

Обычно на Windows это папка вида:

```text
%APPDATA%/my-desktop/workspace.json
```

Пример структуры файла:

```json
{
  "version": 2,
  "profile": {
    "firstName": "Александр",
    "lastName": "Ажеев"
  },
  "projects": [],
  "tasks": [],
  "notifications": [],
  "dismissedNotificationKeys": [],
  "updatedAt": "2026-11-23T12:00:00.000Z"
}
```

Запись выполняется через Electron IPC. Renderer не получает прямой доступ к файловой системе: `preload.cjs` предоставляет только методы `loadWorkspace` и `saveWorkspace`, а main process проверяет структуру данных и записывает JSON атомарно через временный файл и `rename`. В production встроенный Next.js-сервер запускается на случайном свободном loopback-порту; IPC принимается только от доверенного origin главного окна. Внешняя навигация, redirects и popup-окна блокируются.

При первом запуске новой версии выполняется миграция существующих данных из LocalStorage в `workspace.json`. Если приложение запущено в обычном браузере, используется LocalStorage как резервный режим.

Внешняя база данных и сервер не требуются. Файл хранится локально на компьютере пользователя; автоматической синхронизации между устройствами пока нет.

## Архитектура FSD

```text
src/
  app/             # провайдеры, Redux store, корневой layout
  views/           # FSD-слой страниц приложения
  widgets/         # крупные UI-блоки
  features/        # действия пользователя
  entities/        # профиль, проекты, задачи и их модели
  shared/          # UI Kit и общие утилиты
```

## Проверки качества и тестирование

Проект использует встроенный test runner Bun. `jsdom` и React Testing Library нужны для component tests, а `@playwright/test` — для отдельного E2E runner. Все инструменты зафиксированы в `devDependencies` и должны устанавливаться обычной командой `bun install`, чтобы локальная среда и CI использовали один набор зависимостей.

После установки зависимостей один раз установи браузер для Playwright:

```bash
bunx playwright install chromium
```

Запуск проверок:

```bash
bun run typecheck
bun run lint
bun run format:check
bun run test:unit
bun run test:integration
bun run test:component
bun run test:coverage
bun run build
bun run test:e2e
```

`bun test` запускает unit, integration и component tests; каталог `tests/e2e` исключён из discovery Bun, потому что E2E использует отдельный runner Playwright. Для покрытия используются только эти три каталога; отчёт сохраняется в `coverage/lcov.info`. E2E запускаются отдельно командой `bun run test:e2e` после `bun run build`.

### Что покрывают тесты

- Unit: Redux reducers, selectors и календарные date utilities.
- Integration: Redux listener middleware, уведомления, связь проектов с задачами, нормализация и файловая персистентность workspace.
- Component: пользовательское взаимодействие с чекбоксом выполнения задачи через React Testing Library.
- E2E: загрузка Dashboard, создание проекта, сохранение после перезагрузки и `noindex` metadata через Playwright.
- Electron security: проверка происхождения IPC-вызовов и разрешённой навигации.

### CI/CD

GitHub Actions находятся в `.github/workflows/`:

- `ci.yml` — lint, format, TypeScript, тесты, coverage и Next.js production build при PR и push в `main`.
- `security.yml` — OSV dependency scan по `bun.lock` при PR, push и еженедельно.
- `codeql.yml` — статический анализ JavaScript/TypeScript.
- `release.yml` — сборка Windows NSIS, macOS DMG и Linux AppImage при push тега `v*`, затем создание draft GitHub Release.

Для выпуска новой версии обнови `version` в `package.json`, создай и отправь тег:

```bash
git tag v1.9.0
git push origin v1.9.0
```

MacOS-подпись, notarization и публикация автообновлений пока не настроены. Для их включения понадобятся сертификаты и отдельная конфигурация секретов GitHub Actions.

## Центр уведомлений

Верхний колокольчик открывает центр уведомлений. События создаются автоматически при добавлении/удалении задач, завершении задачи, изменении статуса, создании/переименовании/удалении проекта, а также при запуске приложения для задач со сроком сегодня или в прошлом.

В центре можно открыть связанный раздел, отметить уведомление прочитанным, отметить все прочитанными, удалить отдельное уведомление или очистить прочитанные. Уведомления и ключи отклонённых напоминаний сохраняются в `workspace.json`; напоминания не дублируются при следующих запусках.

Хранилище рабочего пространства использует формат версии 2. При чтении файла версии 1 отсутствующие поля уведомлений автоматически заполняются пустыми значениями, поэтому профиль, проекты и задачи остаются совместимыми с предыдущей версией.

## SEO и Open Graph

Сейчас проект является рабочим Dashboard, а не публичным сайтом продукта. Поэтому страницы приложения помечаются `noindex, nofollow`, а sitemap не генерируется. `robots.txt` не блокирует обход HTML-страницы, чтобы роботы могли увидеть noindex directive.

Open Graph и Twitter metadata, OG-изображение 1200×630, favicon, Apple Touch Icon и web manifest сохранены для корректного отображения приложения при передаче ссылки и последующего переиспользования. Публичный marketing/download-сайт планируется как отдельный проект.

Для production добавлены базовые HTTP security headers и Content Security Policy. Внешняя загрузка Google Fonts удалена: приложение использует системный font stack и не зависит от доступности Google Fonts.

В Vercel рекомендуется задать переменную окружения `NEXT_PUBLIC_SITE_URL` со значением основного production URL, например `https://your-project.vercel.app` или собственный домен. Если переменная не задана, проект использует `VERCEL_PROJECT_PRODUCTION_URL`, затем `VERCEL_URL`; локально — `http://localhost:3000`.

FSD-слой страниц называется `views`, а не `pages`: каталог `src/pages` зарезервирован Next.js под Pages Router и не должен использоваться для обычных FSD-модулей при App Router.
