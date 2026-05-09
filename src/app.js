import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';
import pinoHttp from 'pino-http';
import env from './config/env.js';
import { notFoundHandler } from './core/middleware/notFound.js';
import errorHandler from './core/middleware/errorHandler.js';
import passport from './core/auth/passport.js';
import './core/db/associations.js';
import authRoutes from './modules/auth/auth.routes.js';
import postRoutes from './modules/posts/posts.routes.js';
import './core/db/associations.js';

const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });
const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(passport.initialize());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;