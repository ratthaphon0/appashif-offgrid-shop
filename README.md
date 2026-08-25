# AppAshif OFF//GRID Shop — Classroom Demo

ตัวอย่าง Full-stack สำหรับศึกษาเส้นทางข้อมูลจาก Expo frontend ไปยัง Express API
และ MySQL โดยเน้นให้ clone แล้วทำตามได้โดยไม่ใช้ secret หรือข้อมูลฐานจริงของเจ้าของโปรเจกต์

## Current lesson

**Cloud Database + Fetch API + Admin Product CRUD**

หัวข้อที่มีในโค้ดปัจจุบัน:

- Fetch products/categories จาก Express + MySQL
- Skeleton loading และ local read-only fallback
- Search, category filter, drop filter และ sort
- Admin JWT login
- Add / Edit / Delete Product
- Category combobox: เลือกของเดิมหรือพิมพ์ชื่อใหม่เพื่อสร้าง
- Category CRUD
- API validation, CORS, rate limit และ health check

Payment ยังไม่อยู่ในขอบเขตของ demo นี้

คู่มือภาษาไทยสำหรับเรียนตาม: [`docs/CLASSROOM_DEMO_TH.md`](docs/CLASSROOM_DEMO_TH.md)

## Project structure

```text
src/                         Expo / React Native frontend
  app/add.tsx                Add/Edit Product + category combobox
  app/products.tsx           Product list/filter/sort/delete
  context/product-context.tsx
  lib/api.ts                 Fetch API client

backend/                     Express + MySQL backend
  src/routes/                REST API routes
  src/*-repository.js        SQL access layer
  database/database.sql      Empty classroom schema
  database/migrations/       Migration source
  scripts/                   Migrate/admin/API check tools
```

## 1. Create an empty database

Import [`backend/database/database.sql`](backend/database/database.sql) with phpMyAdmin or MySQL.
The file creates the `appashif_demo` schema and tables only—there are no product, category,
or admin rows.

If your provider assigns a database name, replace `appashif_demo` with that name.

## 2. Run the backend

```bash
cd backend
cp .env.example .env
npm ci
```

Edit `backend/.env` with your own MySQL settings and JWT secret, then create the first admin:

```bash
read -rsp 'Admin password: ' APPASHIF_ADMIN_PASSWORD
echo
ADMIN_PASSWORD="$APPASHIF_ADMIN_PASSWORD" npm run admin:create -- --email admin@example.com
unset APPASHIF_ADMIN_PASSWORD
node server.js
```

Default API: `http://localhost:3000/api/v1`

## 3. Run the frontend

From the project root:

```bash
cp .env.example .env.local
npm ci
npm run web
```

Default web URL: `http://localhost:8081`

## Useful commands

```bash
npm run lint
npx tsc --noEmit
npx expo export --platform web

cd backend
npm test
npm run api:check
```

## Database data policy

- `backend/database/database.sql` is schema-only.
- `backend/database/seed-products.json` is intentionally an empty array.
- The four products in `assets/data/products.json` are frontend fallback/demo data only;
  importing the SQL file does not insert them into MySQL.
- Create your own category and products from the Admin UI to complete the exercise.

## Next lesson ideas

The existing Add/Edit/Delete flow can be extended with image upload, richer validation,
pagination, audit history, or additional admin roles without changing the basic API structure.

## Security

Never commit `.env`, `.env.local`, database passwords, admin passwords, JWT secrets,
database dumps with real rows, or `node_modules`.
