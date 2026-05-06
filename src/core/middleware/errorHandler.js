import { AppError } from '../errors/AppError.js';

export default (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      errors: [{ status: err.statusCode, title: err.message }]
    });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      errors: err.errors.map(e => ({
        status: 422,
        title: e.message,
        source: { pointer: `/data/attributes/${e.path}` }
      }))
    });
  }
  req.log?.error(err);
  return res.status(500).json({
    errors: [{ status: 500, title: 'Internal Server Error' }]
  });
};