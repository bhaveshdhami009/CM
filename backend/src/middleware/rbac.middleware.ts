import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from '../utils/AppError.js';

export const hasPermission = (requiredRole: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Check if user is authenticated (should be guaranteed by previous middleware, but good to be safe)
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    // 2. Check if user meets the required role level
    if (req.user.role >= requiredRole) {
      next(); // User has high enough role, proceed
    } else {
      next(new AppError('You do not have permission to perform this action.', 403));
    }
  };
};