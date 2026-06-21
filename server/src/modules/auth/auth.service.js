import crypto from 'crypto';
import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword } from '../../shared/utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/token.js';
import { UnauthorizedError } from '../../shared/errors/AuthError.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

class AuthService {
  /** Register a new user */
  async signup({ name, email, password }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await hashPassword(password);
    const user = await authRepository.create({ name, email, passwordHash });

    const tokens = await this._generateAndSaveTokens(user);
    return { user, ...tokens };
  }

  /** Authenticate a user with email/password */
  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid email or password');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
    const tokens = await this._generateAndSaveTokens(safeUser);
    return { user: safeUser, ...tokens };
  }

  /** Authenticate a user with GitHub */
  async githubLogin(code) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new UnauthorizedError('Failed to get GitHub access token');

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await userRes.json();
    if (!profile.id) throw new UnauthorizedError('Failed to fetch GitHub profile');

    // 3. Upsert user and connection
    const user = await authRepository.upsertGithubUser(profile, accessToken);

    // 4. Generate tokens
    const tokens = await this._generateAndSaveTokens(user);
    return { user, ...tokens };
  }

  /** Refresh access + refresh tokens using a valid refresh token */
  async refreshTokens(refreshToken) {
    if (!refreshToken) throw new UnauthorizedError('No refresh token provided');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const stored = await authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.isRevoked) {
      // Possible token reuse attack — revoke all tokens for this user
      if (decoded.id) await authRepository.revokeAllUserTokens(decoded.id);
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    await authRepository.revokeRefreshToken(stored.id);
    return this._generateAndSaveTokens({ id: decoded.id, email: decoded.email });
  }

  /** Revoke a refresh token on logout */
  async logout(refreshToken) {
    if (!refreshToken) return;
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (stored) await authRepository.revokeRefreshToken(stored.id);
  }

  /** Initiate forgot password flow */
  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) return; // Silent — don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.setResetToken(user.id, resetToken, resetTokenExpiry);
    // In production: send email with reset link containing resetToken
  }

  /** Get current user profile */
  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  /** @private Generate token pair and persist refresh token */
  async _generateAndSaveTokens(user) {
    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
