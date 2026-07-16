import { Router } from 'express';
import { register, login, me, updateMe } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';
import { auth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rate-limiter';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', auth, me);
router.patch('/me', auth, updateMe);

export default router;
