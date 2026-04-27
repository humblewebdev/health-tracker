import { Request, Response } from 'express';
import authService from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';
import { AuthRequest } from '../../middleware/auth.middleware';
import { z } from 'zod';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const result = await authService.register(validatedData);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          error: 'Registration Failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to register user',
        });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const result = await authService.login(validatedData);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
      } else if (error instanceof Error) {
        res.status(401).json({
          error: 'Authentication Failed',
          message: error.message,
        });
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to login',
        });
      }
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData = refreshTokenSchema.parse(req.body);

      // Refresh tokens
      const result = await authService.refreshToken(validatedData.refreshToken);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
      } else {
        res.status(401).json({
          error: 'Token Refresh Failed',
          message: 'Invalid refresh token',
        });
      }
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user data',
      });
    }
  }

  async updateMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const allowedFields = [
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender',
        'height',
        'activityLevel',
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const user = await authService.updateUser(req.user.userId, updateData);

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update user',
      });
    }
  }
}

export default new AuthController();
