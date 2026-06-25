import { prisma } from '../../config/database.js';

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, name: true, email: true, avatar: true, googleId: true, 
        createdAt: true, updatedAt: true, isOnboarded: true, primaryFocus: true,
        jobTitle: true, dreamRole: true, baseCurrency: true, targetIncome: true,
        monthlyBudget: true, codingLanguage: true, githubUrl: true, portfolioUrl: true,
        gender: true, dateOfBirth: true, currentSalary: true, phoneNumber: true,
        address: true, city: true, country: true, timezone: true, mantra: true,
        theme: true, onboardingStep: true, leetcodeUrl: true, linkedinUrl: true, twitterUrl: true,
        totalXp: true, level: true, currentStreak: true, longestStreak: true, rankTitle: true
      },
    });
  }

  async create(data) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true, avatar: true, isOnboarded: true, createdAt: true },
    });
  }

  async findByGithubId(githubId) {
    const conn = await prisma.githubConnection.findUnique({
      where: { githubId },
      include: { user: true }
    });
    return conn?.user;
  }

  async upsertGithubUser(profile, accessToken) {
    const email = profile.email || `${profile.login}@github.com`;
    
    // First, check if a GitHub connection already exists for this GitHub ID
    let existingConnection = await prisma.githubConnection.findUnique({
      where: { githubId: String(profile.id) },
      include: { user: true }
    });

    let user;

    if (existingConnection) {
      // If they connected GitHub before, we know exactly who they are
      user = existingConnection.user;
    } else {
      // Otherwise, check if they have an existing account matching this email
      user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        // Brand new user
        user = await prisma.user.create({
          data: {
            name: profile.name || profile.login,
            email: email,
            avatar: profile.avatar_url,
            isOnboarded: false,
          }
        });
      }
    }

    // Upsert the GitHub connection
    await prisma.githubConnection.upsert({
      where: { githubId: String(profile.id) },
      update: {
        userId: user.id,
        username: profile.login,
        avatar: profile.avatar_url,
        email: email,
        accessToken: accessToken, // In prod, encrypt this!
        lastSyncedAt: new Date()
      },
      create: {
        userId: user.id,
        githubId: String(profile.id),
        username: profile.login,
        avatar: profile.avatar_url,
        email: email,
        accessToken: accessToken,
      }
    });

    return user;
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
