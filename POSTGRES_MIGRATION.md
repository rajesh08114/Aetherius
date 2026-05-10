# PostgreSQL Migration Plan

This project currently runs on MongoDB (Mongoose). PostgreSQL support is now scaffolded with Prisma.

## Added
- `prisma/schema.prisma` with core models and relations.
- `lib/db/prisma.ts` singleton Prisma client.
- `package.json` scripts for Prisma workflow.

## Environment
Set these variables:

```env
DB_PROVIDER=postgres
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/traveloop?schema=public
```

## Setup Commands
```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
```

## Recommended Rollout (Safe)
1. Keep existing MongoDB routes active.
2. Migrate auth routes to Prisma (`/api/v1/auth/*`).
3. Migrate trip CRUD routes to Prisma (`/api/v1/trips*`).
4. Migrate community + AI dependent data routes.
5. Run one-time data migration from MongoDB to PostgreSQL.
6. Remove MongoDB code and env vars.

## Note
At this stage, PostgreSQL schema and client are ready. API routes are still MongoDB-backed until route-by-route migration is completed.
