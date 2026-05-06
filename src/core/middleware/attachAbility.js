import { defineAbilityFor } from '../../modules/auth/ability.factory.js';

export const attachAbility = (req, res, next) => {
  req.ability = defineAbilityFor(req.user);
  next();
};