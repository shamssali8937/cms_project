import dotenv from 'dotenv';
import joi from 'joi';

dotenv.config();

const schema = joi.object({
  PORT: joi.number().default(3000),
  NODE_ENV: joi.string().valid('development', 'production').default('development'),
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().default(5432),
  DB_USER: joi.string().required(),
  DB_PASSWORD: joi.string().allow(''),
  DB_NAME: joi.string().required(),
  DATABASE_URL: joi.string().required(),
  JWT_SECRET: joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('30d')
});

const { error, value: env } = schema.validate(process.env, { stripUnknown: true });
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export default env;