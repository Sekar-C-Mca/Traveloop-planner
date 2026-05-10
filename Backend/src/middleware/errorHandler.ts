import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.message, err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    error: message,
    ...(err.code && { code: err.code }),
  });
};

export const createError = (status: number, message: string, code?: string): AppError => {
  const err: AppError = new Error(message);
  err.status = status;
  if (code) err.code = code;
  return err;
};
