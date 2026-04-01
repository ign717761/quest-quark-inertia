# Quest Quark

Quest Quark это минималистичное kanban-приложение для личного и командного управления задачами. Проект построен на Laravel + Inertia.js + React и делает упор на чистый интерфейс, быстрые действия и обновления досок в реальном времени.

## Возможности

- kanban-доски с собственными колонками и упорядоченными задачами
- drag and drop для колонок и задач
- редактирование задач с описанием, исполнителем и комментариями
- командная работа с приглашениями на доску и ролями участников
- синхронизация в реальном времени через Laravel Reverb
- аутентификация и настройки профиля через Laravel Fortify

## Стек технологий

### Backend

- PHP 8.3+
- Laravel 13
- PostgreSQL
- Laravel Fortify
- Laravel Reverb
- Pest

### Frontend

- React 19
- TypeScript
- Inertia.js
- Vite
- Tailwind CSS 4
- shadcn/ui
- dnd-kit
- Zustand
- Tiptap

## Структура проекта

```text
app/
  Http/Controllers/    HTTP-контроллеры
  Http/Requests/       валидация и правила запросов
  Models/              Eloquent-модели
  Services/            бизнес-логика досок, колонок и задач
  Events/              события для обновлений в реальном времени

resources/
  js/
    pages/             страницы Inertia
    components/        общие UI-компоненты
    layouts/           layout-компоненты приложения
    stores/            состояние Zustand
  css/                 глобальные стили

routes/
  web.php              веб-маршруты
  settings.php         маршруты настроек профиля и аккаунта

database/
  migrations/          схема базы данных
  seeders/             сидеры

tests/
  Feature/             feature-тесты
  Unit/                unit-тесты
```

## Требования

- PHP 8.2 или новее
- Composer
- Node.js 20+
- npm
- PostgreSQL 16+ или Docker

## Переменные окружения

Проект использует PostgreSQL и по умолчанию настроен на Laravel Reverb.

Основные переменные из `.env`:

```env
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=laravel

BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database
SESSION_DRIVER=database
CACHE_STORE=database

REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

## Локальный запуск

### 1. Установить зависимости

```bash
composer install
npm install
```

### 2. Создать файл окружения

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Запустить PostgreSQL

Если PostgreSQL не установлен локально, можно поднять только базу через Docker:

```bash
docker compose up -d
```

### 4. Выполнить миграции

```bash
php artisan migrate
```

Для ручного тестирования приложения удобно сразу залить демо-данные:

```bash
php artisan db:seed
```

Или полностью пересоздать базу с демо-данными:

```bash
php artisan migrate:fresh --seed
```

### 5. Запустить приложение

В одном терминале:

```bash
composer run dev
```

После этого приложение будет доступно по адресу `http://127.0.0.1:8000` или `http://localhost:8000`.

## Быстрая установка

Если нужен базовый сценарий установки одной командой:

```bash
composer run setup
```

Эта команда устанавливает PHP- и JS-зависимости, создаёт `.env`, генерирует ключ приложения, запускает миграции и собирает фронтенд-ассеты.

## Основные команды

### Backend

```bash
php artisan serve
php artisan migrate
php artisan db:seed
php artisan migrate:fresh --seed
php artisan queue:listen --tries=1
php artisan reverb:start
php artisan test
```

### Frontend

```bash
npm run dev
npm run build
npm run build:ssr
npm run lint
npm run types
npm run format
```

### Composer-скрипты

```bash
composer run setup
composer run dev
composer run dev:ssr
composer run test
```

## Docker

В репозитории есть Docker-конфигурация:

- `compose.yml` для запуска приложения, Nginx и PostgreSQL вместе

## Основные маршруты

- `/` главная страница
- `/dashboard` панель со списком досок
- `/boards/{board}` страница доски
- `/settings/profile` настройки профиля
- `/settings/password` настройки пароля
- `/settings/appearance` настройки внешнего вида

## Тестирование

Запуск тестов:

```bash
composer run test
```

## Демо-аккаунты

После `php artisan db:seed` будут доступны фиксированные пользователи для ручной проверки ролей и доступа:

- `admin@example.com` / `password`
- `editor@example.com` / `password`
- `viewer@example.com` / `password`
- `outsider@example.com` / `password`

Что удобно проверять:

- `admin` видит все основные сценарии и может менять состав участников
- `editor` может редактировать рабочие доски, но не администрировать приватную доску
- `viewer` видит общую доску только на чтение
- `outsider` не состоит ни в одной доске и даёт чистый сценарий пустого dashboard

В проекте уже есть feature-тесты для:

- аутентификации
- доступа к dashboard
- настроек профиля и пароля
- двухфакторной аутентификации
- удаления колонок

## Примечания

- Приложение использует серверную аутентификацию Laravel и фронтенд на Inertia React.
- Изменения в досках, колонках и задачах транслируются через события в реальном времени.
- Для части фоновых процессов нужен работающий `queue:listen`, поэтому в разработке его стоит держать запущенным.