export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // Operational errors are predicted errors (validation, auth)
        // Non-operational are programming bugs
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map