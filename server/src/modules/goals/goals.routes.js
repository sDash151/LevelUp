import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createGoalSchema, updateGoalSchema } from './goals.validation.js';
import * as controller from './goals.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getOne);
router.post('/', validate(createGoalSchema), controller.create);
router.put('/:id', validate(updateGoalSchema), controller.update);
router.delete('/:id', controller.remove);
router.put('/:id/milestones/:milestoneId', controller.toggleMilestone);
router.post('/ai/generate-milestones', controller.generateMilestones);
router.get('/ai/insight', controller.getAiInsight);

export default router;
