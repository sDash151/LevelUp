import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createDsaProblemSchema, updateDsaProblemSchema, listDsaProblemsSchema } from './dsa.validation.js';
import * as controller from './dsa.controller.js';

const router = Router();

router.get('/', validate(listDsaProblemsSchema), controller.getAll);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getOne);
router.post('/', validate(createDsaProblemSchema), controller.create);
router.put('/:id', validate(updateDsaProblemSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
