# Журнал работ на строительном объекте

Небольшое fullstack-приложение для учета ежедневных работ на строительном объекте. Прораб может смотреть журнал, фильтровать записи по дате, добавлять, редактировать и удалять выполненные работы.

## Стек

- Frontend: React, TypeScript, Vite.
- Backend: Node.js, Express, TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Запуск: Docker Compose.

Такой стек выбран потому, что он быстро поднимается, хорошо подходит для CRUD-приложения, дает типизацию на frontend и backend, а Prisma упрощает работу со схемой БД и миграциями.

## Возможности

- список записей с датой выполнения, видом работ, объемом, единицей измерения и исполнителем;
- фильтр по диапазону дат;
- сортировка по дате;
- добавление записи с валидацией обязательных полей;
- редактирование записи;
- удаление записи;
- справочник видов работ из базы данных.

## Быстрый запуск через Docker

```bash
docker-compose up --build
```

После запуска:

- frontend: http://localhost:3000
- backend API: http://localhost:4000/api

Backend при старте применяет Prisma-миграции и наполняет справочник видов работ начальными данными.

## Локальный запуск без Docker

Нужен Node.js 20+ и PostgreSQL.

```bash
npm install
cp backend/.env.example backend/.env
npm run prisma:migrate
npm run seed
npm run dev
```

В `backend/.env` укажите строку подключения к PostgreSQL:

```env
DATABASE_URL="postgresql://worklog:worklog@localhost:5432/worklog?schema=public"
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

## API

- `GET /api/work-types` - список видов работ.
- `GET /api/work-logs` - список записей. Поддерживает `startDate`, `endDate`, `sort`.
- `POST /api/work-logs` - создание записи.
- `PUT /api/work-logs/:id` - редактирование записи.
- `DELETE /api/work-logs/:id` - удаление записи.
