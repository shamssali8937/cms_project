import joi from 'joi';

export const createPostSchema = joi.object({
  title: joi.string().max(255).required(),
  content: joi.object().required(),
  excerpt: joi.string().optional(),
  type: joi.string().default('post'),
  status: joi.string().valid('draft','pending','published','scheduled','private').default('draft'),
  scheduledAt: joi.date().iso().when('status', { is: 'scheduled', then: joi.required(), otherwise: joi.optional() })
});

export const updatePostSchema = joi.object({
  title: joi.string().max(255),
  content: joi.object(),
  excerpt: joi.string(),
  status: joi.string().valid('draft','pending','published','scheduled','private','trash'),
  scheduledAt: joi.date().iso()
});