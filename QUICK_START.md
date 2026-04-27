# Quick Start Guide

Get your Health Tracker application running in 5 minutes!

## Step 1: Start Docker Desktop

1. Open Docker Desktop application
2. Wait for it to fully start (the whale icon should be steady)

## Step 2: Start the Database

```bash
docker compose up -d
```

Wait for the database to be ready (about 10-20 seconds).

## Step 3: Setup the Database Schema

```bash
cd backend
npx prisma migrate dev --name init
```

When prompted "We need to reset the PostgreSQL database", type `y` and press Enter.

## Step 4: Start the Backend Server

In the same terminal (or a new one):

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
```

## Step 5: Start the Frontend

Open a NEW terminal window:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Access the Application

1. Open your browser
2. Go to `http://localhost:5173`
3. Click "Register here"
4. Create an account with:
   - Any email (e.g., `test@example.com`)
   - Password must have: uppercase, lowercase, and number (e.g., `Test1234`)
5. You'll be automatically logged in!

## Testing

### Create Account
- Email: `demo@health.app`
- Password: `Demo1234`
- First Name: `Demo`
- Last Name: `User`

### Login
Use the same credentials to login after logging out.

## Stopping the Application

### Stop Frontend & Backend
Press `Ctrl+C` in each terminal window

### Stop Database
```bash
docker compose down
```

## Restarting

Next time, you only need:

1. Start Docker Desktop
2. `docker compose up -d`
3. `cd backend && npm run dev` (in one terminal)
4. `cd frontend && npm run dev` (in another terminal)

## Troubleshooting

### "Port 3001 already in use"
Another app is using port 3001. Either:
- Stop that app
- Or change the port in `backend/.env` (set `PORT=3002` for example)

### "Port 5173 already in use"
Another app is using port 5173. Change it in `frontend/vite.config.ts`

### Cannot connect to database
1. Make sure Docker Desktop is running
2. Run `docker compose ps` - you should see `health_tracker_db` running
3. If not, run `docker compose restart`

### White screen / blank page
1. Open browser DevTools (F12)
2. Check Console for errors
3. Make sure backend is running at http://localhost:3001
4. Clear browser cache and localStorage

## What's Included

Phase 1 (Authentication) is now complete with:

- User registration with validation
- Secure login with JWT tokens
- Protected routes
- Automatic token refresh
- Logout functionality
- Basic dashboard

## Next Steps

Ready to add more features? Check out the implementation plan in `README.md` for:

- Phase 2: Nutrition Tracking
- Phase 3: Weight & Measurements
- Phase 4: Water Intake
- Phase 5: Exercise Tracking
- Phase 6: Dashboard & Analytics

Each phase builds on the previous one!
