import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createJobSchema, updateJobSchema, listJobsSchema } from './jobs.validation.js';
import * as controller from './jobs.controller.js';

const router = Router();

router.get('/', validate(listJobsSchema), controller.getAll);
router.get('/stats', controller.getStats);
router.post('/:id/ai-prep', controller.generateAIPrep);
router.post('/:id/start-prep', controller.startPreparation);
router.get('/:id', controller.getOne);
router.post('/', validate(createJobSchema), controller.create);
router.put('/:id', validate(updateJobSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
