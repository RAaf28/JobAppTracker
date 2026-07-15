import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} from './applications.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createApplicationSchema, updateApplicationSchema } from './applications.validation';

const router = Router();

router.use(auth);

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.post('/', validate(createApplicationSchema), createApplication);
router.patch('/:id', validate(updateApplicationSchema), updateApplication);
router.delete('/:id', deleteApplication);

export default router;
