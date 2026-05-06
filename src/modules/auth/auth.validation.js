import joi from 'joi';

export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  displayName: joi.string().min(2).max(150).required()
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  deviceId: joi.string().optional()
});

export const refreshSchema = joi.object({
  refreshToken: joi.string().required(),
  deviceId: joi.string().optional()
});