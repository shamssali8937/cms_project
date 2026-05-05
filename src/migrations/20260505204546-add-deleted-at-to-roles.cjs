'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'deleted_at', { type: Sequelize.DATE });
    await queryInterface.addColumn('permissions', 'deleted_at', { type: Sequelize.DATE });
    await queryInterface.addColumn('refresh_tokens', 'deleted_at', { type: Sequelize.DATE });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('roles', 'deleted_at');
    await queryInterface.removeColumn('permissions', 'deleted_at');
    await queryInterface.removeColumn('refresh_tokens', 'deleted_at');
  }
};