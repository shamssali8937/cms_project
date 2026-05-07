'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove duplicates
    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions
      WHERE (role_id, permission_id, created_at) NOT IN (
        SELECT DISTINCT ON (role_id, permission_id) role_id, permission_id, created_at
        FROM role_permissions
        ORDER BY role_id, permission_id, created_at ASC
      )
    `);

    // Add composite primary key
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id', 'permission_id'],
      type: 'primary key',
      name: 'pk_role_permissions'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('role_permissions', 'pk_role_permissions');
  }
};