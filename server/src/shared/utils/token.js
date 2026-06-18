import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

/** Generate a short-lived access token */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
};

/** Generate a long-lived refresh token */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });
};

/** Verify an access token */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/** Verify a refresh token */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
