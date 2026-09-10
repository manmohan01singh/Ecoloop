import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { User } from '../models/index.js';

function generateTokens(user) {
  const accessToken = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, city, state, pincode } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Email already registered' },
      });
    }

    const user = await User.create({ name, email, phone, password, address, city, state, pincode });
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      data: { user: user.toJSON(), tokens },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: { user: user.toJSON(), tokens },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user.toJSON(),
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;
    await req.user.update({ name, phone, address, city, state, pincode });

    res.json({
      success: true,
      data: req.user.toJSON(),
      message: 'Profile updated',
    });
  } catch (error) {
    next(error);
  }
};
