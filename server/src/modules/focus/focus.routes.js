import { Router } from 'express';
import { focusController } from './focus.controller.js';

const router = Router();

router.post('/start', focusController.start);
router.put('/:id/complete', focusController.complete);
router.get('/today', focusController.today);
router.delete('/:id', focusController.remove);

export default router;
