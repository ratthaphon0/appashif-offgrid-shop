# AppAshif — Full-Stack Product Catalog

> A full-stack product catalog application built with Expo, Express, and MySQL. It demonstrates a complete product-management workflow: browse, search, filter, authenticate as an administrator, and manage products and categories through a protected REST API.

## Project overview

AppAshif is designed as a submission-ready full-stack project. The Expo frontend provides a responsive catalogue experience, while the Express backend exposes a validated MySQL API for products, categories, authentication, and health checks.

The repository is intentionally safe to clone and demonstrate:

- the SQL file creates an empty schema only;
- sample frontend products are local fallback data, not live database records;
- passwords, tokens, database dumps, and `.env` files are excluded from Git.

## Features

| Area | Implemented capabilities |
| --- | --- |
| Product catalogue | Product cards, responsive grid, skeleton loading, cart interactions, and local fallback data when the API is unavailable |
| Discovery | Text search across name, category, and description; category/drop filters; price and name sorting |
| Product management | Admin-only create, edit, archive/delete, restore/undo, and active-state controls |
| Category management | Create, rename, and delete categories; the product form supports selecting an existing category or creating one from typed input |
| Authentication | Admin sign-in with JWT bearer tokens; tokens remain in memory and are cleared when the app reloads |
| Backend quality | Input validation, request IDs, CORS allowlist, rate limiting, security headers, structured logging, and liveness/readiness endpoints |

## Architecture

```text
Expo / React Native Web frontend
        │
        ▼
src/lib/api.ts  ── Fetch API + Bearer token
        │
        ▼
Express REST API (/api/v1)
        │
        ├── validation, authentication, rate limiting
        ├── product/category repositories
        ▼
MySQL
  categories · products · product_images · admins
```

## Technology stack

- **Frontend:** Expo SDK 57, Expo Router, React 19, React Native, TypeScript
- **Backend:** Node.js, Express 5, MySQL2
- **Security and validation:** JSON Web Tokens, bcryptjs, Zod, Helmet, CORS, express-rate-limit
- **Testing:** Node.js test runner and Supertest

## Repository structure

```text
src/
  app/                         Expo Router screens
    add.tsx                    Admin add/edit product form
    products.tsx               Search, filters, sort, delete, restore
    categories.tsx             Category management
  context/
    auth-context.tsx           Admin authentication state
    product-context.tsx        Catalog/category state and CRUD actions
  lib/api.ts                   Typed frontend API client

backend/
  src/routes/                  Auth, product, category, and health routes
  src/*-repository.js          MySQL data-access layer
  database/database.sql        Empty database schema
  scripts/                     Migration, admin, seed, and API-check helpers
  test/                        Backend unit/integration tests

docs/CLASSROOM_DEMO_TH.md      Thai walkthrough for the demo flow
deliverables/code-captures/    Labeled code images used for presentation material
```

## Quick start

### Prerequisites

- Node.js **22.13+**
- npm
- MySQL or a MySQL-compatible server

### 1. Create the database

Import [`backend/database/database.sql`](backend/database/database.sql) with MySQL or phpMyAdmin. It creates the `appashif_demo` schema and required tables without creating a user, category, or product.

If your provider gives you a database name, adjust the `CREATE DATABASE` / `USE` statements or import the table definitions into that database.

### 2. Configure and start the backend

```bash
cd backend
cp .env.example .env
npm ci
```

Update `backend/.env` with your MySQL connection values and a secure JWT secret. Then create the first administrator and start the API:

```bash
read -rsp 'Admin password: ' APPASHIF_ADMIN_PASSWORD
echo
ADMIN_PASSWORD="$APPASHIF_ADMIN_PASSWORD" npm run admin:create -- --email admin@example.com
unset APPASHIF_ADMIN_PASSWORD

npm start
```

The default API base URL is `http://localhost:3000/api/v1`.

### 3. Configure and start the frontend

From the repository root:

```bash
cp .env.example .env.local
npm ci
npm run web
```

Open the local Expo web URL, normally `http://localhost:8081`.

The default frontend environment values are:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_DEPLOYMENT_LABEL=LOCAL CLASSROOM API
```

## Demo flow

1. Open the catalogue to browse products, search by keyword, filter by category/drop, and change the sort order.
2. Open **Add** and sign in with the administrator account you created.
3. Create a product. You can select an existing category or type a new category name.
4. Go to **Products** to edit the product, archive/delete it, or use the short undo window to restore it.
5. Open **Categories** to create, rename, or remove categories that are not currently referenced by a product.

For a Thai step-by-step teaching guide, see [`docs/CLASSROOM_DEMO_TH.md`](docs/CLASSROOM_DEMO_TH.md).

## API summary

Base path: `/api/v1`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Authenticate an administrator and return a JWT |
| `GET` | `/products` | Public | List products with search/filter query parameters |
| `GET` | `/products/:id` | Public | Read one product |
| `POST` | `/products` | Admin | Create a product |
| `PATCH` | `/products/:id` | Admin | Partially update a product |
| `DELETE` | `/products/:id` | Admin | Archive/remove a product; supports `?permanent=true` |
| `GET` | `/categories` | Public | List categories |
| `POST` | `/categories` | Admin | Create a category |
| `PATCH`, `DELETE` | `/categories/:slug` | Admin | Update or remove a category |
| `GET` | `/health/live` | Public | Confirm API process liveness |
| `GET` | `/health/ready` | Public | Confirm API and database readiness |

Admin requests require:

```http
Authorization: Bearer <access-token>
```

## Validation and checks

Run these commands before submitting changes:

```bash
# Frontend (from repository root)
npm run lint
npx tsc --noEmit
npx expo export --platform web

# Backend
cd backend
npm test
npm run api:check
```

`npm run api:check` verifies public endpoints. It skips mutation testing unless you provide temporary `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables for that shell session.

## Security and data policy

- Do not commit `.env`, `.env.local`, access tokens, database passwords, JWT secrets, or real database exports.
- Create a strong, unique `JWT_SECRET` for every real environment.
- The backend rejects the development JWT secret and missing database password when `NODE_ENV=production`.
- Product and category mutations require a valid admin JWT and are validated before they reach the database.
- The tracked SQL schema contains **no real user, product, category, or admin data**.

## Submission checklist

- [x] Expo frontend with responsive product catalogue
- [x] Express REST API and MySQL schema
- [x] Product and category CRUD
- [x] Search, filter, sort, and cart interactions
- [x] Admin authentication and protected mutations
- [x] Validation, health endpoints, CORS, rate limiting, and tests
- [x] Reproducible setup instructions without private credentials

## License

This repository includes the MIT license distributed with the original Expo project template. See [LICENSE](LICENSE).
