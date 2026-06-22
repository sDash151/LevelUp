import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createReflectionSchema, updateReflectionSchema, listReflectionsSchema } from './reflections.validation.js';
import * as controller from './reflections.controller.js';

const router = Router();

router.get('/', validate(listReflectionsSchema), controller.getAll);
router.get('/stats', controller.getStats);
router.get('/mood-history', controller.getMoodHistory);
router.get('/ai/insight', controller.getAiInsight);
router.get('/:id', controller.getOne);
router.post('/', validate(createReflectionSchema), controller.create);
router.put('/:id', validate(updateReflectionSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
