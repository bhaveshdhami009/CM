import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

// Helper to extract constraints recursively
function getValidationMessages(errors: ValidationError[]): string[] {
  let messages: string[] = [];
  
  errors.forEach(err => {
    if (err.constraints) {
      messages.push(...Object.values(err.constraints));
    }
    if (err.children && err.children.length > 0) {
      messages.push(...getValidationMessages(err.children));
    }
  });
  
  return messages;
}

export function validateDto(type: any, skipMissingProperties = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(type, req.body);
    
    validate(dtoObj, { skipMissingProperties, whitelist: true, forbidNonWhitelisted: true })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const messages = getValidationMessages(errors);
          const messageStr = messages.join('; ');
          
          // Use 400 for Bad Request
          next(new AppError(`Validation Error: ${messageStr}`, 400));
        } else {
          // Sanitize: use the DTO object which has correct types/transforms
          req.body = dtoObj;
          next();
        }
      });
  };
}