import { Sequelize } from 'sequelize';
import env from '../../config/env.js';

// Use DATABASE_URL from environment
const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    paranoid: true,
    timestamps: true
  }
});

export default sequelize;