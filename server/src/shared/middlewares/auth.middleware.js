import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError } from '../errors/AuthError.js';

/**
 * JWT authentication middleware.
 * Extracts Bearer token, verifies it, and attaches user to req.
 */
export const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};
