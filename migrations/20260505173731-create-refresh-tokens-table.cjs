'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token_hash: { type: Sequelize.STRING(255), allowNull: false },
      device_id: { type: Sequelize.STRING(100) },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  }
};
