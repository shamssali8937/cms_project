import { DataTypes } from 'sequelize';
import sequelize from '../../core/db/sequelize.js';

export const Revision = sequelize.define('Revision', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  postId: { type: DataTypes.BIGINT, field: 'post_id', allowNull: false },
  authorId: { type: DataTypes.BIGINT, field: 'author_id', allowNull: false },
  title: DataTypes.STRING(255),
  content: DataTypes.JSON,
  excerpt: DataTypes.TEXT,
  changeSummary: { type: DataTypes.STRING(500), field: 'change_summary' },
}, {
  tableName: 'post_revisions',
  underscored: true,
  timestamps: true,
  updatedAt: false,
});