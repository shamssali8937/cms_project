import { DataTypes } from 'sequelize';
import sequelize from '../../core/db/sequelize.js';

export const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  resource: { type: DataTypes.STRING(80), allowNull: false },
  action: { type: DataTypes.STRING(40), allowNull: false },
}, {
  tableName: 'permissions',
  underscored: true,
  timestamps: true,
});