import { User } from '../../modules/users/user.model.js';
import { Role } from '../../modules/users/role.model.js';
import { Permission } from '../../modules/users/permission.model.js';
import { RefreshToken } from '../../modules/users/refreshToken.model.js';
import { Post } from '../../modules/posts/post.model.js';
import { Revision } from '../../modules/posts/revision.model.js';

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

Role.belongsToMany(Permission, { 
  through: { model: 'role_permissions', timestamps: false }, 
  foreignKey: 'role_id', 
  otherKey: 'permission_id', 
  as: 'permissions' 
});

Permission.belongsToMany(Role, { 
  through: { model: 'role_permissions', timestamps: false }, 
  foreignKey: 'permission_id', 
  otherKey: 'role_id' 
});

User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Post.hasMany(Revision, { foreignKey: 'postId' });
Revision.belongsTo(Post, { foreignKey: 'postId' });
Revision.belongsTo(User, { as: 'author', foreignKey: 'authorId' });