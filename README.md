# Health Tracking Application

A full-stack web application for tracking nutrition, exercise, weight/measurements, and water intake.

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Zustand + React Query
- React Router v6

**Backend:**
- Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
2. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

3. Setup Backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

4. Setup Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Environment Variables

See `.env.example` files in frontend and backend directories.

## Features

- User authentication and authorization
- Nutrition tracking with macro goals
- Weight and body measurements tracking
- Water intake tracking
- Exercise logging
- Dashboard with analytics and trends
