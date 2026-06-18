import { prisma } from '../../config/database.js';

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatar: true, googleId: true, createdAt: true, updatedAt: true },
    });
  }

  async create(data) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });
  }

  async updatePassword(id, passwordHash) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async setResetToken(id, resetToken, resetTokenExpiry) {
    return prisma.user.update({ where: { id }, data: { resetToken, resetTokenExpiry } });
  }

  async clearResetToken(id) {
    return prisma.user.update({ where: { id }, data: { resetToken: null, resetTokenExpiry: null } });
  }

  async findByResetToken(token) {
    return prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
  }

  async saveRefreshToken(userId, token, expiresAt) {
    return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revokeRefreshToken(id) {
    return prisma.refreshToken.update({ where: { id }, data: { isRevoked: true } });
  }

  async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } });
  }
}

export const authRepository = new AuthRepository();
