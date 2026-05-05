import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../../modules/users/user.model.js';
import { Role } from '../../modules/users/role.model.js';
import { verifyPassword } from '../../modules/auth/auth.service.js';
import env from '../../config/env.js';

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'roles' }] });
      if (!user) return done(null, false, { message: 'Invalid credentials' });
      if (user.status !== 'active') return done(null, false, { message: 'Account inactive' });
      const valid = await verifyPassword(user.passwordHash, password);
      if (!valid) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) { return done(err); }
  }
));

passport.use(new JwtStrategy(
  { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: env.JWT_SECRET },
  async (payload, done) => {
    try {
      const user = await User.findOne({ where: { cuid: payload.sub }, include: [{ model: Role, as: 'roles' }] });
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) { return done(err); }
  }
));

export default passport;