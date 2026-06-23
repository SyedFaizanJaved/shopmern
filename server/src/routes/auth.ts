import { Router } from 'express';
import { register, login, me, refresh, logout } from '../controllers/auth';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validation/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me); // protected: requireAuth runs first

export default router;
