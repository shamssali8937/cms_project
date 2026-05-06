import { User } from '../../modules/users/user.model.js';
import { Role } from '../../modules/users/role.model.js';
import { RefreshToken } from '../../modules/users/refreshToken.model.js';


User.belongsToMany(Role, { 
  through: { model: 'user_roles', timestamps: false }, 
  foreignKey: 'user_id', 
  otherKey: 'role_id', 
  as: 'roles' 
});

Role.belongsToMany(User, { 
  through: { model: 'user_roles', timestamps: false }, 
  foreignKey: 'role_id', 
  otherKey: 'user_id' 
});


User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });
