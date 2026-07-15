import { Router } from 'express';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from './companies.controller';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createCompanySchema, updateCompanySchema } from './companies.validation';

const router = Router();

// Apply auth middleware to all company routes
router.use(auth);

router.get('/', getCompanies);
router.post('/', validate(createCompanySchema), createCompany);
router.patch('/:id', validate(updateCompanySchema), updateCompany);
router.delete('/:id', deleteCompany);

export default router;
