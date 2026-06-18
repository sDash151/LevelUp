export class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
