"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      cuid: { type: Sequelize.STRING(26), unique: true, allowNull: false },
      email: { type: Sequelize.STRING(190), unique: true, allowNull: false },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      display_name: { type: Sequelize.STRING(150), allowNull: false },
      bio: { type: Sequelize.TEXT },
      avatar_media_id: { type: Sequelize.BIGINT },
      status: { type: Sequelize.ENUM('active','suspended','pending'), defaultValue: 'pending' },
      last_login_at: { type: Sequelize.DATE },
      meta: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE }
    });
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['status']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};