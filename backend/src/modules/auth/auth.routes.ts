import { Router } from 'express';
import { register, login, me, updateMe } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';
import { auth } from '../../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, me);
router.patch('/me', auth, updateMe);

export default router;
