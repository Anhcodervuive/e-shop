export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(message: string, statusCode: number, isOperational: boolean = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, true, details);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation error', details?: any) {
        super(message, 400, true, details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed', details?: any) {
        super(message, 401, true, details);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Authorization failed', details?: any) {
        super(message, 403, true, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', details?: any) {
        super(message, 500, true, details);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', details?: any) {
        super(message, 400, true, details);
    }
}

export class RateLimitError extends AppError { 
    constructor(message: string = 'Too many requests', details?: any) {
        super(message, 429, true, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflict error', details?: any) {
        super(message, 409, true, details);
    }
}

export * from './try-catch';
