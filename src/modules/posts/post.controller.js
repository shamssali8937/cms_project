import * as postService from './post.service.js';
import { Post } from './post.model.js';
import { AppError } from '../../core/errors/AppError.js';

export const create = async (req, res, next) => {
  try {
    // Check if user can create a Post (subject type, not an instance)
    if (!req.ability.can('create', 'Post')) {
      throw new AppError('Forbidden: you are not allowed to create posts', 403);
    }
    const post = await postService.createPost(req.body, req.user.id);
    res.status(201).json({ data: post });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const { cuid } = req.params;
    // Fetch the existing post (including soft-deleted? no – only non-deleted for update)
    const post = await Post.findOne({ where: { cuid } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    // Check permission on the specific post instance
    if (!req.ability.can('update', post)) {
      throw new AppError('Forbidden: you are not allowed to update this post', 403);
    }
    const updatedPost = await postService.updatePost(cuid, req.body, req.user.id);
    res.json({ data: updatedPost });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { cuid } = req.params;
    const post = await Post.findOne({ where: { cuid } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    if (!req.ability.can('delete', post)) {
      throw new AppError('Forbidden: you are not allowed to delete this post', 403);
    }
    await postService.deletePost(cuid);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const restore = async (req, res, next) => {
  try {
    const { cuid } = req.params;
    // Find the soft-deleted post (paranoid: false)
    const post = await Post.findOne({ where: { cuid }, paranoid: false });
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    // Restoration requires update permission on the post (same as update)
    if (!req.ability.can('update', post)) {
      throw new AppError('Forbidden: you are not allowed to restore this post', 403);
    }
    await postService.restorePost(cuid);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const listRevisions = async (req, res, next) => {
  try {
    const { cuid } = req.params;
    const post = await Post.findOne({ where: { cuid } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    // Anyone who can read the post can list its revisions
    if (!req.ability.can('read', post)) {
      throw new AppError('Forbidden: you cannot view revisions of this post', 403);
    }
    const revisions = await postService.getRevisions(cuid);
    res.json({ data: revisions });
  } catch (err) {
    next(err);
  }
};

export const restoreRevision = async (req, res, next) => {
  try {
    const { cuid, revId } = req.params;
    const post = await Post.findOne({ where: { cuid } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    // Restoring a revision is an update operation
    if (!req.ability.can('update', post)) {
      throw new AppError('Forbidden: you are not allowed to restore a revision of this post', 403);
    }
    const restoredPost = await postService.restoreRevision(cuid, revId, req.user.id);
    res.json({ data: restoredPost });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await postService.listPosts(req.user, req.query);
    res.json(result);
  } catch (err) { next(err); }
};

// NEW: GET SINGLE POST
export const getOne = async (req, res, next) => {
  try {
    const post = await postService.getPostByCuid(req.params.cuid, req.user);
    res.json({ data: post });
  } catch (err) {
    if (err.message === 'Post not found') return next(new AppError('Post not found', 404));
    if (err.message === 'Forbidden') return next(new AppError('Forbidden', 403));
    next(err);
  }
};