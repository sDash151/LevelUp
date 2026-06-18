import { prisma } from '../../config/database.js';

const XP_PER_LEVEL = 5000;

export async function awardXp(userId, amount, reason = '') {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: amount },
    },
  });
  // Recalculate level
  const newLevel = Math.floor(user.totalXp / XP_PER_LEVEL) + 1;
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }
  return { xpAwarded: amount, totalXp: user.totalXp, level: newLevel, reason };
}
