import { DataTypes } from 'sequelize';
import sequelize from '../../core/db/sequelize.js';
import { createId } from '@paralleldrive/cuid2';

export const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  cuid: { type: DataTypes.STRING(26), unique: true, allowNull: false, defaultValue: () => createId() },
  email: { type: DataTypes.STRING(190), unique: true, allowNull: false, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), field: 'password_hash', allowNull: false },
  displayName: { type: DataTypes.STRING(150), field: 'display_name', allowNull: false },
  bio: DataTypes.TEXT,
  avatarMediaId: { type: DataTypes.BIGINT, field: 'avatar_media_id' },
  status: { type: DataTypes.ENUM('active','suspended','pending'), defaultValue: 'pending' },
  lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
  meta: DataTypes.JSON,
}, {
  tableName: 'users',
  underscored: true,
  paranoid: true,
});