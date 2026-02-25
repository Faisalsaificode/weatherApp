import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getCurrentWeather, getForecast } from '../services/weatherService.js';
import City from '../models/City.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', async (req, res, next) => {
  try {
    const cities = await City.find({ user: req.user._id }).sort({ isFavorite: -1, addedAt: 1 });
    const units = req.user.temperatureUnit === 'fahrenheit' ? 'imperial' : 'metric';

    const weatherPromises = cities.map(async (city) => {
      try {
        const weather = await getCurrentWeather(city.lat, city.lon, units);
        return { cityId: city._id, weather, error: null };
      } catch {
        return { cityId: city._id, weather: null, error: 'Failed to fetch weather' };
      }
    });

    const weatherData = await Promise.all(weatherPromises);

    const result = cities.map((city) => {
      const wd = weatherData.find((w) => w.cityId.toString() === city._id.toString());
      return {
        city: {
          id: city._id,
          name: city.name,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
          isFavorite: city.isFavorite,
          addedAt: city.addedAt,
        },
        weather: wd?.weather || null,
        error: wd?.error || null,
      };
    });

    res.json({ data: result, units });
  } catch (err) {
    next(err);
  }
});

router.get('/city/:id', async (req, res, next) => {
  try {
    const city = await City.findOne({ _id: req.params.id, user: req.user._id });
    if (!city) return res.status(404).json({ error: 'City not found.' });

    const units = req.user.temperatureUnit === 'fahrenheit' ? 'imperial' : 'metric';
    const [weather, forecast] = await Promise.all([
      getCurrentWeather(city.lat, city.lon, units),
      getForecast(city.lat, city.lon, units),
    ]);

    res.json({ city, weather, forecast, units });
  } catch (err) {
    next(err);
  }
});

export default router;
