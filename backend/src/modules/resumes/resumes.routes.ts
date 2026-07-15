import { Router } from 'express';
import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from './resumes.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createResumeSchema, updateResumeSchema } from './resumes.validation';

const router = Router();

router.use(auth);

router.get('/', getResumes);
router.post('/', validate(createResumeSchema), createResume);
router.patch('/:id', validate(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);

export default router;
