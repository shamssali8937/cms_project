import { DataTypes } from 'sequelize';
import sequelize from '../../core/db/sequelize.js';
import { createId } from '@paralleldrive/cuid2';

export const Post = sequelize.define('Post', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  cuid: { type: DataTypes.STRING(26), unique: true, allowNull: false, defaultValue: () => createId() },
  authorId: { type: DataTypes.BIGINT, field: 'author_id', allowNull: false },
  type: { type: DataTypes.STRING(40), defaultValue: 'post' },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  excerpt: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('draft','pending','published','scheduled','private','trash'), defaultValue: 'draft' },
  publishedAt: { type: DataTypes.DATE, field: 'published_at' },
  scheduledAt: { type: DataTypes.DATE, field: 'scheduled_at' },
}, {
  tableName: 'posts',
  underscored: true,
  paranoid: true,
});