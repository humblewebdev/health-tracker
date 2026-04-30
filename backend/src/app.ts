import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import authRoutes from './modules/auth/auth.routes';
import nutritionRoutes from './modules/nutrition/nutrition.routes';
import preferencesRoutes from './modules/users/preferences.routes';
import measurementsRoutes from './modules/measurements/measurements.routes';
import waterRoutes from './modules/water/water.routes';
import exerciseRoutes from './modules/exercise/exercise.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import recipeRoutes from './modules/recipes/recipe.routes';
import mealPlanRoutes from './modules/meal-plans/meal-plan.routes';
import adminRoutes from './modules/admin/admin.routes';
import { authenticate } from './middleware/auth.middleware';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Health Tracker API',
    version: '1.0.0',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Nutrition routes
app.use('/api/nutrition', nutritionRoutes);

// Preferences routes
app.use('/api/preferences', preferencesRoutes);

// Measurements routes
app.use('/api/measurements', measurementsRoutes);

// Water routes
app.use('/api/water', waterRoutes);

// Exercise routes
app.use('/api/exercises', exerciseRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Recipe routes
app.use('/api/recipes', recipeRoutes);

// Meal plan routes
app.use('/api/meal-plans', mealPlanRoutes);

// Admin routes
app.use('/api/admin', authenticate, adminRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

export default app;
