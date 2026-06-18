import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { success, created } from '../../shared/utils/response.js';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const signup = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  created(res, { user, accessToken }, 'Account created successfully');
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  success(res, { user, accessToken }, 'Logged in successfully');
});

export const refresh = asyncHandler(async (req, res) => {
  const oldToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshTokens(oldToken);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  success(res, { accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  await authService.logout(token);
  res.clearCookie('refreshToken', { path: '/' });
  success(res, null, 'Logged out successfully');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  success(res, null, 'If an account exists with this email, a reset link has been sent');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  success(res, { user });
});
