import { Router } from 'express';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from './interviews.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createInterviewSchema, updateInterviewSchema } from './interviews.validation';

const router = Router();

router.use(auth);

router.get('/', getInterviews);
router.post('/', validate(createInterviewSchema), createInterview);
router.patch('/:id', validate(updateInterviewSchema), updateInterview);
router.delete('/:id', deleteInterview);

export default router;
