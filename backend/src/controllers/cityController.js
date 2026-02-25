import City from '../models/City.js';
import { searchCities } from '../services/weatherService.js';

export const getCities = async (req, res, next) => {
  try {
    const cities = await City.find({ user: req.user._id }).sort({ isFavorite: -1, displayOrder: 1, addedAt: 1 });
    res.json({ cities });
  } catch (err) {
    next(err);
  }
};

export const addCity = async (req, res, next) => {
  try {
    const { name, country, countryCode, lat, lon } = req.body;

    if (!name || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: 'City name, latitude, and longitude are required.' });
    }

    // Check if already added
    const exists = await City.findOne({
      user: req.user._id,
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lon.toFixed(4)),
    });

    if (exists) {
      return res.status(409).json({ error: 'City already in your dashboard.' });
    }

    const city = await City.create({
      user: req.user._id,
      name,
      country,
      countryCode,
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lon.toFixed(4)),
    });

    res.status(201).json({ message: 'City added successfully.', city });
  } catch (err) {
    next(err);
  }
};

export const removeCity = async (req, res, next) => {
  try {
    const city = await City.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }
    res.json({ message: 'City removed successfully.' });
  } catch (err) {
    next(err);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const city = await City.findOne({ _id: req.params.id, user: req.user._id });
    if (!city) {
      return res.status(404).json({ error: 'City not found.' });
    }

    city.isFavorite = !city.isFavorite;
    await city.save();

    res.json({ message: `City ${city.isFavorite ? 'added to' : 'removed from'} favorites.`, city });
  } catch (err) {
    next(err);
  }
};

export const searchCity = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
    }

    const results = await searchCities(q.trim());
    res.json({ results });
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'Weather API key invalid. Please check configuration.' });
    }
    next(err);
  }
};
