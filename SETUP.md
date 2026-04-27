# Health Tracker - Setup Guide

This guide will help you get the Health Tracker application up and running.

## Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- Docker Desktop (for PostgreSQL database)
- npm or yarn package manager

## Initial Setup

### 1. Start the Database

First, ensure Docker Desktop is running, then start the PostgreSQL container:

```bash
docker compose up -d
```

Verify the database is running:
```bash
docker compose ps
```

You should see the `health_tracker_db` container running.

### 2. Setup Backend

Install dependencies:
```bash
cd backend
npm install
```

Initialize Prisma and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Generate the Prisma Client
- Create the database schema
- Apply migrations

(Optional) Open Prisma Studio to view your database:
```bash
npx prisma studio
```

Start the backend server:
```bash
npm run dev
```

The backend should now be running at `http://localhost:3001`

Test the health check endpoint:
```bash
curl http://localhost:3001/health
```

### 3. Setup Frontend

Open a new terminal window.

Install dependencies:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend should now be running at `http://localhost:5173`

## Testing the Application

### 1. Access the Application

Open your browser and navigate to `http://localhost:5173`

You should be redirected to the login page.

### 2. Create an Account

1. Click "Register here" to go to the registration page
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test1234 (must have uppercase, lowercase, and number)
   - Confirm Password: Test1234
3. Click "Register"

You should be automatically logged in and redirected to the dashboard.

### 3. Test Login/Logout

1. Click "Logout" in the top right
2. You should be redirected to the login page
3. Login with:
   - Email: test@example.com
   - Password: Test1234
4. You should be redirected back to the dashboard

## API Endpoints

The following endpoints are available:

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Login to existing account
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info (requires auth)
- `PUT /api/auth/me` - Update user profile (requires auth)

### Testing with curl

Register a user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

Get user profile (replace TOKEN with your access token):
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Database Management

### View Database in Prisma Studio
```bash
cd backend
npx prisma studio
```

### Reset Database
```bash
cd backend
npx prisma migrate reset
```

This will:
- Drop the database
- Create a new database
- Run all migrations

### Create New Migration
After modifying `schema.prisma`:
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

**Backend (3001):**
- Edit `backend/.env` and change `PORT=3001` to another port
- Update `frontend/.env` VITE_API_URL to match

**Frontend (5173):**
- Edit `frontend/vite.config.ts` and change the `server.port` value

### Database Connection Failed

1. Make sure Docker Desktop is running
2. Verify PostgreSQL container is running: `docker compose ps`
3. Check the DATABASE_URL in `backend/.env` matches the docker-compose.yml settings
4. Restart the container: `docker compose restart`

### Prisma Client Not Generated

Run:
```bash
cd backend
npx prisma generate
```

### CORS Errors

Make sure the backend CORS_ORIGIN in `backend/.env` matches your frontend URL:
```
CORS_ORIGIN=http://localhost:5173
```

### Token Refresh Issues

Clear your browser's localStorage and try logging in again:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Clear all items
4. Refresh the page and login again

## Development Workflow

### Running Both Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Making Database Changes

1. Edit `backend/src/database/prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name description`
3. Prisma Client is auto-regenerated
4. Restart backend server (ts-node-dev should auto-restart)

## Next Steps

Phase 1 (Authentication) is complete! You can now:

1. Add more user profile fields
2. Implement Phase 2: Nutrition Tracking
3. Implement Phase 3: Weight & Measurements
4. Implement Phase 4: Water Intake
5. Implement Phase 5: Exercise Tracking
6. Implement Phase 6: Dashboard & Analytics

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://health_user:health_password@localhost:5432/health_tracker"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production server
npx prisma studio    # Open database GUI
npx prisma migrate dev  # Run migrations

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Docker
docker compose up -d      # Start database
docker compose down       # Stop database
docker compose logs -f    # View logs
docker compose restart    # Restart database
```

## Support

For issues or questions, refer to the implementation plan in the README.md file.
