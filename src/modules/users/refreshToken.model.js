import { DataTypes } from 'sequelize';
import sequelize from '../../core/db/sequelize.js';

export const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
  tokenHash: { type: DataTypes.STRING(255), field: 'token_hash', allowNull: false },
  deviceId: { type: DataTypes.STRING(100), field: 'device_id' },
  expiresAt: { type: DataTypes.DATE, field: 'expires_at', allowNull: false },
  revokedAt: { type: DataTypes.DATE, field: 'revoked_at' },
}, {
  tableName: 'refresh_tokens',
  underscored: true,
  timestamps: true,
  updatedAt: false,
  paranoid: false,
});