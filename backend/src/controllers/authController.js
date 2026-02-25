import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};


export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        temperatureUnit: user.temperatureUnit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        temperatureUnit: user.temperatureUnit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      temperatureUnit: req.user.temperatureUnit,
    },
  });
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { temperatureUnit } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { temperatureUnit },
      { new: true, runValidators: true }
    );
    res.json({
      message: 'Preferences updated.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        temperatureUnit: user.temperatureUnit,
      },
    });
  } catch (err) {
    next(err);
  }
};


