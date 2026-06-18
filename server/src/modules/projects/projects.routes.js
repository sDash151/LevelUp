import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createProjectSchema, updateProjectSchema, listProjectsSchema } from './projects.validation.js';
import * as c from './projects.controller.js';

const router = Router();
router.get('/', validate(listProjectsSchema), c.getAll);
router.get('/stats', c.getStats);
router.get('/:id', c.getOne);
router.post('/', validate(createProjectSchema), c.create);
router.put('/:id', validate(updateProjectSchema), c.update);
router.delete('/:id', c.remove);

export default router;
