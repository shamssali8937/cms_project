'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_revisions', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      post_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'posts', key: 'id' }, onDelete: 'CASCADE' },
      author_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
      title: { type: Sequelize.STRING(255), allowNull: false },
      content: { type: Sequelize.JSON, allowNull: false },
      excerpt: Sequelize.TEXT,
      change_summary: { type: Sequelize.STRING(500) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('post_revisions', ['post_id', 'created_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('post_revisions');
  }
};