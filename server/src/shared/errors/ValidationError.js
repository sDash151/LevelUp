import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(errors = [], message = 'Validation failed') {
    super(message, 422, errors);
  }
}
