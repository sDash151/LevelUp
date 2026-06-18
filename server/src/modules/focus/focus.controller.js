import { focusService } from './focus.service.js';

export const focusController = {
  async start(req, res, next) {
    try {
      const { duration = 25, label } = req.body;
      const session = await focusService.startSession(req.user.id, { duration, label });
      res.status(201).json({ success: true, data: session });
    } catch (err) { next(err); }
  },

  async complete(req, res, next) {
    try {
      const { actualMins } = req.body;
      const session = await focusService.completeSession(req.user.id, req.params.id, actualMins || 25);
      res.json({ success: true, data: session });
    } catch (err) { next(err); }
  },

  async today(req, res, next) {
    try {
      const sessions = await focusService.getTodaySessions(req.user.id);
      res.json({ success: true, data: sessions });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await focusService.deleteSession(req.user.id, req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
};
