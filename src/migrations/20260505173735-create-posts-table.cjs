'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      cuid: { type: Sequelize.STRING(26), unique: true, allowNull: false },
      author_id: { type: Sequelize.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'RESTRICT' },
      type: { type: Sequelize.STRING(40), defaultValue: 'post' },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false },
      content: { type: Sequelize.JSON, allowNull: false },
      excerpt: Sequelize.TEXT,
      status: { type: Sequelize.ENUM('draft','pending','published','scheduled','private','trash'), defaultValue: 'draft' },
      published_at: Sequelize.DATE,
      scheduled_at: Sequelize.DATE,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      deleted_at: Sequelize.DATE
    });
    await queryInterface.addIndex('posts', ['slug']);
    await queryInterface.addIndex('posts', ['type', 'status']);
    await queryInterface.addIndex('posts', ['scheduled_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  }
};
