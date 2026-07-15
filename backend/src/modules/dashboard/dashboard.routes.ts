import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller';
import { auth } from '../../middleware/auth';

const router = Router();

router.get('/', auth, getDashboardStats);

export default router;
