import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createTransactionSchema, updateTransactionSchema, listTransactionsSchema } from './finance.validation.js';
import * as c from './finance.controller.js';

const router = Router();
router.get('/', validate(listTransactionsSchema), c.getAll);
router.get('/summary', c.getSummary);
router.get('/:id', c.getOne);
router.post('/', validate(createTransactionSchema), c.create);
router.put('/:id', validate(updateTransactionSchema), c.update);
router.delete('/:id', c.remove);

export default router;
