'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_roles', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('role_permissions', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('user_roles', 'updated_at');
    await queryInterface.removeColumn('role_permissions', 'updated_at');
  }
};