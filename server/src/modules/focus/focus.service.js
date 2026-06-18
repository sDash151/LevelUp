import { focusRepository } from './focus.repository.js';

class FocusService {
  async startSession(userId, data) {
    return focusRepository.createSession(userId, data);
  }

  async completeSession(userId, sessionId, actualMins) {
    const session = await focusRepository.completeSession(sessionId, userId, actualMins);
    if (!session) throw new Error('Session not found or unauthorized');
    return session;
  }

  async getTodaySessions(userId) {
    return focusRepository.getTodaySessions(userId);
  }

  async deleteSession(userId, sessionId) {
    const session = await focusRepository.deleteSession(sessionId, userId);
    if (!session) throw new Error('Session not found or unauthorized');
    return session;
  }
}

export const focusService = new FocusService();
