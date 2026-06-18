import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { createWorkoutSchema, updateWorkoutSchema, logFitnessSchema, listWorkoutsSchema } from './fitness.validation.js';
import * as c from './fitness.controller.js';

const router = Router();
router.get('/workouts', validate(listWorkoutsSchema), c.getWorkouts);
router.get('/workouts/stats', c.getStats);
router.get('/workouts/:id', c.getWorkout);
router.post('/workouts', validate(createWorkoutSchema), c.createWorkout);
router.put('/workouts/:id', validate(updateWorkoutSchema), c.updateWorkout);
router.delete('/workouts/:id', c.deleteWorkout);
router.post('/log', validate(logFitnessSchema), c.logDaily);
router.get('/log/history', c.getLogHistory);

export default router;
