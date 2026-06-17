import { Request, Response } from "express";
import { logger } from '@packages/logger';
import { AppError } from ".";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: any) => {
    if (err instanceof AppError) {
        logger.warn({
            method: req.method,
            url: req.url,
            statusCode: err.statusCode,
            message: err.message,
            details: err.details,
        }, 'Request failed');

        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.details ? { details: err.details } : {})
        });
    }

    logger.error({
        method: req.method,
        url: req.url,
        error: err,
    }, 'Unhandled error');

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
}
