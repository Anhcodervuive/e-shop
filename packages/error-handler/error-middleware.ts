import { Request, Response } from "express";
import { AppError } from ".";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: any) => {
    if (err instanceof AppError) {
        console.log(`Error ${req.method} ${req.url}: ${err.message}`);

        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err.details ? { details: err.details } : {})
        });
    }

    console.log('Unhandle error: ', err);

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
}