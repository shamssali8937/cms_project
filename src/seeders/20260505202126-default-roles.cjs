'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { name: 'super_admin', label: 'Super Admin', is_system: true, created_at: new Date(), updated_at: new Date() },
      { name: 'admin', label: 'Admin', is_system: true, created_at: new Date(), updated_at: new Date() },
      { name: 'editor', label: 'Editor', is_system: true, created_at: new Date(), updated_at: new Date() },
      { name: 'author', label: 'Author', is_system: true, created_at: new Date(), updated_at: new Date() },
      { name: 'contributor', label: 'Contributor', is_system: true, created_at: new Date(), updated_at: new Date() },
      { name: 'subscriber', label: 'Subscriber', is_system: true, created_at: new Date(), updated_at: new Date() }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};