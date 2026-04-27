# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with two separate applications:

- `frontend/` — React 18 + TypeScript + Vite SPA
- `backend/` — Express.js + TypeScript REST API

Each has its own `package.json` and must be run independently.

## Commands

### Frontend (`cd frontend`)

```bash
npm run dev       # Vite dev server on :5173
npm run build     # tsc + vite build
npm run lint      # ESLint (zero warnings policy)
npm run preview   # Preview production build
```

### Backend (`cd backend`)

```bash
npm run dev              # ts-node-dev with auto-restart
npm run build            # tsc → dist/
npm start                # Run compiled output
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Run pending migrations
npm run prisma:studio    # Open Prisma Studio at :5555
```

### Database

```bash
docker-compose up -d                              # Start PostgreSQL on :5432
npx prisma migrate dev --name <name>              # Create + run new migration
npx prisma migrate reset                          # Wipe and re-run all migrations
```

There is no test suite yet — no Jest, Vitest, or Playwright is configured.

## Environment Setup

**Backend** — create `backend/.env` from `backend/.env.example`:
```
DATABASE_URL="postgresql://health_user:health_password@localhost:5432/health_tracker"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

**Frontend** — create `frontend/.env` from `frontend/.env.example`:
```
VITE_API_URL=http://localhost:3001/api
```

The Vite dev server also proxies `/api` → `http://localhost:3001` during development.

## Architecture

### Backend

Feature-based module structure under `backend/src/modules/`. Each module follows the pattern:

```
modules/<feature>/
  <feature>.controller.ts   # Request/response handling
  <feature>.service.ts      # Business logic + Prisma queries
  <feature>.routes.ts       # Express router
  <feature>.validation.ts   # Zod schemas for request bodies
```

Modules: `auth`, `nutrition`, `water`, `exercise`, `measurements`, `recipes`, `meal-plans`, `dashboard`, `users`.

Entry point: `server.ts` → `app.ts` wires all routes under `/api/<feature>`.

Protected routes use the `authenticate` middleware (`src/middleware/`) which validates JWT access tokens. Refresh tokens are handled at `/api/auth/refresh`.

### Frontend

```
src/
  pages/          # One component per route
  components/
    layout/       # Shell, nav, sidebar
    features/     # Feature-specific components
    common/       # Shared UI primitives
  store/          # Zustand stores (authStore)
  services/       # Axios-based API clients (one per module)
  types/          # Shared TypeScript interfaces
```

`App.tsx` defines React Router v6 routes. Authenticated routes are wrapped in `ProtectedRoute`.

State: Zustand for auth state, React Query (`@tanstack/react-query`) for all server data.

Path alias `@/*` resolves to `src/*` in both Vite and tsconfig.

### Database

PostgreSQL via Docker Compose. Schema at `backend/prisma/schema.prisma`. Key models: `User`, `UserPreferences`, `FoodEntry`, `CustomFood`, `Exercise`, `Measurement`, `WaterIntake`, `Recipe`, `RecipeIngredient`, `MealPlan`, `MealPlanRecipe`. All user-owned records cascade-delete when the user is deleted.
