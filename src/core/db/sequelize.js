import { Sequelize } from 'sequelize';
import env from '../../config/env.js';

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
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