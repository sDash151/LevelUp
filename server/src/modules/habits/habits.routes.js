import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createHabitSchema, updateHabitSchema, toggleCompleteSchema } from './habits.validation.js';
import * as controller from './habits.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/stats', controller.getStats);
router.get('/rich-stats', controller.getRichStats);
router.get('/calendar-stats', controller.getCalendarStats);
router.get('/:id', controller.getOne);
router.post('/', validate(createHabitSchema), controller.create);
router.put('/:id', validate(updateHabitSchema), controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/complete', validate(toggleCompleteSchema), controller.toggleComplete);

export default router;
