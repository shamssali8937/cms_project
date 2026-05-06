import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../users/user.model.js';
import { Role } from '../users/role.model.js';
import { RefreshToken } from '../users/refreshToken.model.js';
import env from '../../config/env.js';

export const hashPassword = (password) => argon2.hash(password);
export const verifyPassword = (hash, password) => argon2.verify(hash, password);

export const generateAccessToken = (user) => {
  const roles = user.roles ? user.roles.map(r => r.name) : [];
  return jwt.sign(
    { sub: user.cuid, email: user.email, roles },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
};

export const generateRefreshToken = async (userId, deviceId = null) => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  await RefreshToken.create({ userId, tokenHash: hashed, deviceId, expiresAt });
  return token;
};

export const registerUser = async ({ email, password, displayName }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('Email already exists');
  const hashed = await hashPassword(password);
  const user = await User.create({ email, passwordHash: hashed, displayName, status: 'active' });
  const subscriberRole = await Role.findOne({ where: { name: 'subscriber' } });
  if (subscriberRole) await user.addRole(subscriberRole);
  return user;
};

export const loginUser = async (email, password, deviceId = null) => {
  const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'roles' }] });
  if (!user) throw new Error('Invalid credentials');
  if (user.status !== 'active') throw new Error('Account inactive');
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) throw new Error('Invalid credentials');
  await user.update({ lastLoginAt: new Date() });
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id, deviceId);
  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (oldRefreshToken, deviceId = null) => {
  const hashed = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
  const tokenRecord = await RefreshToken.findOne({
    where: { tokenHash: hashed, revokedAt: null },
    include: [{ model: User, include: [{ model: Role, as: 'roles' }] }]
  });
  if (!tokenRecord) throw new Error('Invalid refresh token');
  if (tokenRecord.expiresAt < new Date()) throw new Error('Refresh token expired');
  await tokenRecord.update({ revokedAt: new Date() });
  const newRefreshToken = await generateRefreshToken(tokenRecord.userId, deviceId);
  const newAccessToken = generateAccessToken(tokenRecord.User);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash: hashed } });
};