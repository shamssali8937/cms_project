import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { validate } from '../../core/middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation.js';
import * as authController from './auth.controller.js';

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { errors: [{ status: 429, title: 'Too many login attempts' }] } });

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', passport.authenticate('jwt', { session: false }), authController.me);

export default router;