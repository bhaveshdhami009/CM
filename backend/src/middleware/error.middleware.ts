import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { QueryFailedError } from 'typeorm';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  console.error('💥 ERROR CAUGHT:', err);

  // 1. Handle TypeORM/Database Errors
  if (err instanceof QueryFailedError) {
    // Postgres Error Code 23502: Not Null Violation
    if (err.driverError.code === '23502') {
      const column = err.driverError.column;
      error = new AppError(`Missing required value for field: ${column}`, 400);
    }
    // Postgres Error Code 23505: Unique Constraint Violation
    if (err.driverError.code === '23505') {
      error = new AppError('Duplicate value. This record already exists.', 409);
    }
    
    if (err.driverError.code === '22007') {
       error = new AppError(`Invalid data format provided to the database. Check date fields.`, 400);
    }
  }

  // 2. Handle JWT Errors
  if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
  if (err.name === 'TokenExpiredError') error = new AppError('Your token has expired. Please log in again.', 401);

  // 3. Send Response
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  res.status(statusCode).json({
    status: status,
    message: error.message || 'Something went wrong!',
    // Include stack trace only in dev
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};