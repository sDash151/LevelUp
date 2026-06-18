import { Router } from 'express';
import * as c from './insights.controller.js';

const router = Router();
router.get('/', c.getInsights);

export default router;
