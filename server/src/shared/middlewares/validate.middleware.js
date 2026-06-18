import { ValidationError } from '../errors/ValidationError.js';

/**
 * Zod schema validation middleware factory.
 * @param {import('zod').ZodObject} schema - Zod schema with body/params/query keys
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ValidationError(errors);
  }

  // Replace with parsed (coerced/transformed) values
  req.body = result.data.body ?? req.body;
  req.params = result.data.params ?? req.params;
  req.query = result.data.query ?? req.query;

  next();
};
