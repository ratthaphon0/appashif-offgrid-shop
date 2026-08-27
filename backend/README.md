# AppAshif Backend

Express 5 + MySQL API for the AppAshif product catalogue. It provides product/category CRUD,
authentication, filtering, sorting, pagination, and deployment health checks. Payment is not included.

## Empty database setup

Import `database/database.sql` in phpMyAdmin or MySQL. The file creates the
`appashif_demo` schema and tables only. The sanitized `database/appashif_cloud_export.sql`
file contains catalogue data but intentionally contains no administrator credential row.

Alternatively, create the database yourself and run the migration:

```bash
cp .env.example .env
npm ci
npm run db:migrate
```

Do not import the Cloud export into production without a backup and review. Create the
administrator separately with `npm run admin:create`.

## Create the first admin

```bash
read -rsp 'Admin password: ' APPASHIF_ADMIN_PASSWORD
echo
ADMIN_PASSWORD="$APPASHIF_ADMIN_PASSWORD" npm run admin:create -- --email admin@example.com
unset APPASHIF_ADMIN_PASSWORD
```

Do not put the password in Git, `.env.example`, or source code.

## Start and verify

```bash
node server.js
npm run api:check
```

The default local API base is `http://127.0.0.1:3000/api/v1`. The assigned live Cloud API uses port 3067.

## Main API

- `POST /api/v1/auth/login`
- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET|POST /api/v1/products`
- `GET|PUT|PATCH|DELETE /api/v1/products/:id`
- `GET|POST /api/v1/categories`
- `GET|PUT|PATCH|DELETE /api/v1/categories/:slug`

Product list query parameters include `search`, `categorySlug`, `minPrice`,
`maxPrice`, `inStock`, `onSale`, `badge`, `sort`, `page`, and `limit`.
Mutating routes require `Authorization: Bearer <accessToken>`.

## Cloud deployment

Upload only this backend source directory, excluding `.env` and `node_modules`.
Install dependencies on the server with:

```bash
npm ci --omit=dev
node server.js
```

Use only the port, database name, and credentials assigned to your own account.
