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
    const { name, email, phone, password, address, city, state, pincode, bio, username: customUsername } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required' },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Email already registered' },
      });
    }

    // Determine unique username
    let username = customUsername ? customUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30) : null;
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        username = null; // will generate below
      }
    }
    if (!username) {
      const base = (name || cleanEmail.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20) || 'user';
      let candidate = base;
      let counter = 1;
      while (await User.findOne({ where: { username: candidate } })) {
        candidate = `${base}_${counter++}`;
      }
      username = candidate;
    }

    // SECURITY REQUIREMENT: Public registration must always create an ordinary user account ('user').
    // Never trust client-supplied role.
    const user = await User.create({ 
      name: name.trim(), 
      username,
      email: cleanEmail, 
      phone: phone ? phone.trim() : null, 
      password, 
      address, 
      city, 
      state, 
      pincode,
      bio: bio || null,
      role: 'user', // strictly forced to ordinary user
      verificationStatus: 'unverified',
    });
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      data: { user: user.toJSON(), tokens, token: tokens.accessToken },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: cleanEmail } });
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
      data: { user: user.toJSON(), tokens, token: tokens.accessToken },
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
    const { name, phone, address, city, state, pincode, bio, avatar, coverImage, isPrivate } = req.body;
    // Whitelist only allowed profile fields - users cannot modify their own role or verificationStatus
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (isPrivate !== undefined) updates.isPrivate = Boolean(isPrivate);

    await req.user.update(updates);

    res.json({
      success: true,
      data: req.user.toJSON(),
      message: 'Profile updated',
    });
  } catch (error) {
    next(error);
  }
};
