import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export const defineAbilityFor = (user) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  if (!user) {
    can('read', 'Post', { status: 'published' });
    return build();
  }
  const roles = user.roles?.map(r => r.name) || [];
  if (roles.includes('super_admin')) can('manage', 'all');
  else if (roles.includes('admin')) {
    can('manage', 'all');
    cannot('manage', 'Plugin');
    cannot('manage', 'User', { role: 'super_admin' });
  } else if (roles.includes('editor')) {
    can(['read', 'update', 'delete'], 'Post');
    can('publish', 'Post');
  } else if (roles.includes('author')) {
    can('create', 'Post');
    can(['read', 'update', 'delete'], 'Post', { authorId: user.id });
    can('upload', 'Media');
  } else if (roles.includes('contributor')) {
    can('create', 'Post');
    can(['read', 'update'], 'Post', { authorId: user.id, status: 'draft' });
  }
  can('read', 'Post', { status: 'published' });
  return build();
};