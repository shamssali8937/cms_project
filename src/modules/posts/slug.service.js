import slugify from 'slugify';
import { Post } from './post.model.js';
import { Op } from 'sequelize';

export const generateUniqueSlug = async (title, type = 'post', parentId = null, excludeId = null) => {
  const baseSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const where = { slug, type };
    if (parentId) where.parentId = parentId;
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Post.findOne({ where });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};