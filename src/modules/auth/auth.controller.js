import * as authService from './auth.service.js';
import { AppError } from '../../core/errors/AppError.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ data: { id: user.cuid, email: user.email, displayName: user.displayName } });
  } catch (err) {
    if (err.message === 'Email already exists') return next(new AppError('Email already exists', 409));
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, deviceId } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password, deviceId);
    res.json({ data: { user: { id: user.cuid, email: user.email, displayName: user.displayName }, accessToken, refreshToken } });
  } catch (err) {
    if (err.message === 'Invalid credentials' || err.message === 'Account inactive')
      return next(new AppError(err.message, 401));
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken, deviceId } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken, deviceId);
    res.json({ data: tokens });
  } catch (err) {
    if (err.message === 'Invalid refresh token' || err.message === 'Refresh token expired')
      return next(new AppError(err.message, 401));
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.body.refreshToken);
    res.status(204).send();
  } catch (err) { 
    next(err);
   }
};

export const me = async (req, res) => {
  res.json({ 
    data: { 
      id: req.user.cuid, 
      email: req.user.email,
      displayName: req.user.displayName,
      roles: req.user.roles?.map(r => ({ name: r.name, label: r.label }))
     } });
};