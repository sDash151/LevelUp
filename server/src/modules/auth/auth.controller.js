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

import { prisma } from '../../config/database.js';

export const githubAuth = asyncHandler(async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = env.GITHUB_CALLBACK_URL;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email`;
  res.redirect(githubUrl);
});

export const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.redirect('http://localhost:5173/login?error=no_code');

  // If this was initiated from the Projects page, redirect back there with the code and original state
  if (state && state.startsWith('projects:')) {
    const originalState = state.split('projects:')[1];
    return res.redirect(`http://localhost:5173/projects?code=${code}&state=${originalState}`);
  }

  // Otherwise, handle as a Login
  try {
    const { user, accessToken, refreshToken } = await authService.githubLogin(code);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.redirect(`http://localhost:5173/login?token=${accessToken}&onboarded=${user.isOnboarded}`);
  } catch (error) {
    res.redirect('http://localhost:5173/login?error=auth_failed');
  }
});

export const onboardUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  // 1. Update User Profile
  await prisma.user.update({
    where: { id: userId },
    data: {
      jobTitle: data.jobTitle,
      dreamRole: data.dreamRole,
      targetIncome: data.targetIncome,
      primaryFocus: data.primaryFocus,
      baseCurrency: data.baseCurrency || 'USD',
      isOnboarded: true,
      totalXp: { increment: 50 }, // Give 50 XP for onboarding!
    }
  });

  // 2. Upsert Fitness Profile
  await prisma.fitnessProfile.upsert({
    where: { userId },
    update: {
      height: data.height,
      weight: data.weight,
      goal: data.goal,
      experienceLevel: data.experienceLevel
    },
    create: {
      userId,
      height: data.height,
      weight: data.weight,
      goal: data.goal || 'general',
      experienceLevel: data.experienceLevel || 'beginner'
    }
  });

  success(res, null, 'Onboarding complete! +50 XP');
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

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  success(res, { user });
});
