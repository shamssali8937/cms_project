'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Remove duplicate entries (keep the oldest created_at per pair)
    await queryInterface.sequelize.query(`
      DELETE FROM user_roles
      WHERE (user_id, role_id, created_at) NOT IN (
        SELECT DISTINCT ON (user_id, role_id) user_id, role_id, created_at
        FROM user_roles
        ORDER BY user_id, role_id, created_at ASC
      )
    `);

    // Step 2: Add composite primary key
    await queryInterface.addConstraint('user_roles', {
      fields: ['user_id', 'role_id'],
      type: 'primary key',
      name: 'pk_user_roles'
    });
  },

  async down(queryInterface) {
    // Remove the primary key constraint
    await queryInterface.removeConstraint('user_roles', 'pk_user_roles');
  }
};