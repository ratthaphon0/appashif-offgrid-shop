# Security Policy

## Scope

AppAshif includes an Expo frontend and an Express/MySQL backend. Product and category mutations are protected by administrator authentication and a JWT bearer token.

## Do not commit

- `.env` or `.env.local`
- Database passwords or JWT secrets
- Access tokens or private keys
- The original Cloud export `ip_std6730202734.sql`

The repository may contain the sanitized catalogue export at `backend/database/appashif_cloud_export.sql`. It intentionally omits administrator credential rows.

## Reporting

Do not open a public issue for a credential or security vulnerability. Contact the project owner privately with the affected file, reproduction steps, and a suggested mitigation. Rotate exposed credentials immediately.

## Deployment safety

Use the Cloud handoff and User Manual for deployment checks. Never run the AppAshif process with root PM2, and never modify unrelated services or `/var/www/html`.
