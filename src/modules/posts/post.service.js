import { Op } from 'sequelize';
import { Post } from './post.model.js';
import { Revision } from './revision.model.js';
import { generateUniqueSlug } from './slug.service.js';
import { assertValidTransition } from './post.stateMachine.js';
import { eventEmitter } from '../../core/events/eventEmitter.js';
import { defineAbilityFor } from '../auth/ability.factory.js';

export const createPost = async (data, authorId) => {
  const slug = await generateUniqueSlug(data.title, data.type);
  const post = await Post.create({
    ...data,
    slug,
    authorId,
    status: data.status || 'draft'
  });
  eventEmitter.emit('post.created', post);
  return post;
};

export const updatePost = async (cuid, updates, userId) => {
  const post = await Post.findOne({ where: { cuid } });
  if (!post) throw new Error('Post not found');
  // create revision
  await Revision.create({
    postId: post.id,
    authorId: userId,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    changeSummary: 'Auto-saved revision'
  });
  // prune old revisions (keep last 30)
  const count = await Revision.count({ where: { postId: post.id } });
  if (count > 30) {
    const oldest = await Revision.findAll({ where: { postId: post.id }, order: [['createdAt', 'ASC']], limit: count - 30 });
    await Revision.destroy({ where: { id: oldest.map(r => r.id) } });
  }
  if (updates.status && updates.status !== post.status) {
    assertValidTransition(post.status, updates.status);
  }
  if (updates.title && updates.title !== post.title) {
    updates.slug = await generateUniqueSlug(updates.title, post.type, null, post.id);
  }
  await post.update(updates);
  eventEmitter.emit('post.updated', post);
  return post;
};

export const deletePost = async (cuid) => {
  const post = await Post.findOne({ where: { cuid } });
  if (!post) throw new Error('Post not found');
  await post.destroy();
  eventEmitter.emit('post.trashed', post);
};

export const restorePost = async (cuid) => {
  const post = await Post.findOne({ where: { cuid }, paranoid: false });
  if (!post) throw new Error('Post not found');
  await post.restore();
  eventEmitter.emit('post.restored', post);
};

export const getRevisions = async (cuid) => {
  const post = await Post.findOne({ where: { cuid } });
  if (!post) return [];
  return Revision.findAll({ where: { postId: post.id }, order: [['createdAt', 'DESC']] });
};

export const restoreRevision = async (postCuid, revisionId, userId) => {
  const post = await Post.findOne({ where: { cuid: postCuid } });
  if (!post) throw new Error('Post not found');
  const revision = await Revision.findOne({ where: { id: revisionId, postId: post.id } });
  if (!revision) throw new Error('Revision not found');
  await Revision.create({
    postId: post.id,
    authorId: userId,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    changeSummary: `Restored revision ${revisionId}`
  });
  await post.update({
    title: revision.title,
    content: revision.content,
    excerpt: revision.excerpt
  });
  return post;
};

export const listPosts = async (user, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;

  let where = {};

  if (!user) {
    where.status = 'published';
  } else {
    const ability = defineAbilityFor(user); 
    const roles = user.roles?.map(r => r.name) || [];
    if (roles.includes('super_admin') || roles.includes('admin') || roles.includes('editor')) {
      where = {};
    } else if (roles.includes('author') || roles.includes('contributor')) {
      where = {
        [Op.or]: [
          { authorId: user.id },
          { status: 'published' }
        ]
      };
    } else {
      where.status = 'published';
    }
  }

  if (query.status && (user?.roles?.some(r => ['admin','editor','super_admin'].includes(r.name)))) {
    where.status = query.status;
  }
  if (query.type) where.type = query.type;
  if (query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${query.search}%` } },
      { excerpt: { [Op.iLike]: `%${query.search}%` } }
    ];
  }

  const { count, rows } = await Post.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit,
    attributes: { exclude: ['deletedAt'] }
  });

  return {
    data: rows,
    meta: {
      pagination: {
        currentPage: page,
        perPage: limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    }
  };
};

export const getPostByCuid = async (cuid, user) => {
  const post = await Post.findOne({ where: { cuid } });
  if (!post) throw new Error('Post not found');

  const ability = defineAbilityFor(user);
  if (!ability.can('read', post)) {
    throw new Error('Forbidden');
  }
  return post;
};