import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../utils/AppError.js';
// Helper to extract constraints recursively
function getValidationMessages(errors) {
    let messages = [];
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
export function validateDto(type, skipMissingProperties = false) {
    return (req, res, next) => {
        const dtoObj = plainToInstance(type, req.body);
        validate(dtoObj, { skipMissingProperties, whitelist: true, forbidNonWhitelisted: true })
            .then((errors) => {
            if (errors.length > 0) {
                const messages = getValidationMessages(errors);
                const messageStr = messages.join('; ');
                // Use 400 for Bad Request
                next(new AppError(`Validation Error: ${messageStr}`, 400));
            }
            else {
                // Sanitize: use the DTO object which has correct types/transforms
                req.body = dtoObj;
                next();
            }
        });
    };
}
//# sourceMappingURL=validation.middleware.js.map