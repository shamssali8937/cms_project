import express from 'express';
import passport from 'passport';
import { attachAbility } from '../../core/middleware/attachAbility.js';
import { validate } from '../../core/middleware/validate.js';
import { createPostSchema, updatePostSchema } from './post.validation.js';
import * as postController from './post.controller.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.use(attachAbility);

router.get('/', postController.list);
router.get('/:cuid', postController.getOne);

router.post('/', validate(createPostSchema), postController.create);
router.patch('/:cuid', validate(updatePostSchema), postController.update);
router.delete('/:cuid', postController.deletePost);
router.post('/:cuid/restore', postController.restore);
router.get('/:cuid/revisions', postController.listRevisions);
router.post('/:cuid/revisions/:revId/restore', postController.restoreRevision);

export default router;