import { AppError } from '../errors/AppError.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.url} not found`, 404));
};