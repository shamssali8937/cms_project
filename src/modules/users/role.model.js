import { DataTypes } from 'sequelize';
import sequelize from '../../core/db/sequelize.js';

export const Role = sequelize.define('Role', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(40), unique: true, allowNull: false },
  label: { type: DataTypes.STRING(80), allowNull: false },
  isSystem: { type: DataTypes.BOOLEAN, field: 'is_system', defaultValue: false },
}, {
  tableName: 'roles',
  underscored: true,
  timestamps: true,
});