import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import City from '../models/City.js';
import { getCurrentWeather, getForecast } from '../services/weatherService.js';

const router = Router();

router.use(authenticate);
router.post('/insights', async (req, res, next) => {
  try {
    const { cityId, question } = req.body;

    const city = await City.findOne({ _id: cityId, user: req.user._id });
    if (!city) return res.status(404).json({ error: 'City not found.' });

    const units = req.user.temperatureUnit === 'fahrenheit' ? 'imperial' : 'metric';
    const unitLabel = units === 'metric' ? '°C' : '°F';
    const speedLabel = units === 'metric' ? 'm/s' : 'mph';

    const [weather, forecast] = await Promise.all([
      getCurrentWeather(city.lat, city.lon, units),
      getForecast(city.lat, city.lon, units),
    ]);
    const weatherContext = {
      city: city.name,
      country: city.country,
      current: weather,
      forecast,
      units: { temp: unitLabel, speed: speedLabel },
    };
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });

        const prompt = `You are a helpful weather assistant. You provide concise, practical weather insights and recommendations.

Current weather data for ${city.name}, ${city.country}:
- Temperature: ${weather.temperature}${unitLabel} (feels like ${weather.feelsLike}${unitLabel})
- Condition: ${weather.description}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed}${speedLabel}
- Visibility: ${weather.visibility}km
5-day forecast: ${forecast.map(f => `${f.date}: ${f.tempMin}-${f.tempMax}${unitLabel}, ${f.condition}`).join('; ')}

User question: ${question || `Give me a weather insight and activity recommendation for today in ${city.name}.`}

Respond in 2-3 sentences max. Be specific and actionable.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return res.json({
          insight: text,
          source: 'ai',
          weatherContext,
        });
      } catch (aiErr) {
        console.error('Gemini error, falling back to rule-based:', aiErr.message);
      }
    }
    const insight = generateRuleBasedInsight(weather, forecast, city.name, unitLabel, speedLabel);
    res.json({ insight, source: 'rule-based', weatherContext });
  } catch (err) {
    next(err);
  }
});

router.get('/alerts', async (req, res, next) => {
  try {
    const cities = await City.find({ user: req.user._id });
    const units = req.user.temperatureUnit === 'fahrenheit' ? 'imperial' : 'metric';
    const unitLabel = units === 'metric' ? '°C' : '°F';

    const alertPromises = cities.map(async (city) => {
      try {
        const weather = await getCurrentWeather(city.lat, city.lon, units);
        const alerts = detectAlerts(weather, units, unitLabel);
        return alerts.length > 0 ? { city: city.name, cityId: city._id, alerts } : null;
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(alertPromises)).filter(Boolean);
    res.json({ alerts: results });
  } catch (err) {
    next(err);
  }
});

function detectAlerts(weather, units, unitLabel) {
  const alerts = [];
  const hotThreshold = units === 'metric' ? 35 : 95;
  const coldThreshold = units === 'metric' ? 0 : 32;
  const windThreshold = units === 'metric' ? 15 : 33;

  if (weather.temperature >= hotThreshold) {
    alerts.push({ type: 'heat', severity: 'warning', message: `Extreme heat: ${weather.temperature}${unitLabel}. Stay hydrated!` });
  }
  if (weather.temperature <= coldThreshold) {
    alerts.push({ type: 'cold', severity: 'warning', message: `Freezing conditions: ${weather.temperature}${unitLabel}. Dress warmly!` });
  }
  if (weather.windSpeed >= windThreshold) {
    alerts.push({ type: 'wind', severity: 'caution', message: `Strong winds: ${weather.windSpeed} ${units === 'metric' ? 'm/s' : 'mph'}. Be careful outdoors.` });
  }
  if (['Thunderstorm', 'Snow', 'Tornado'].includes(weather.condition)) {
    alerts.push({ type: 'severe', severity: 'danger', message: `${weather.condition} detected! Exercise extreme caution.` });
  }
  if (weather.humidity > 90) {
    alerts.push({ type: 'humidity', severity: 'info', message: `Very high humidity: ${weather.humidity}%. May feel uncomfortable.` });
  }
  return alerts;
}

function generateRuleBasedInsight(weather, forecast, cityName, unitLabel, speedLabel) {
  const parts = [];

  if (weather.temperature > (unitLabel === '°C' ? 30 : 86)) {
    parts.push(`It's quite hot in ${cityName} at ${weather.temperature}${unitLabel} — stay hydrated and avoid direct sun during midday.`);
  } else if (weather.temperature < (unitLabel === '°C' ? 5 : 41)) {
    parts.push(`It's cold in ${cityName} at ${weather.temperature}${unitLabel} — layer up and watch for icy conditions.`);
  } else {
    parts.push(`Current conditions in ${cityName} are ${weather.description} at ${weather.temperature}${unitLabel}.`);
  }

  
  if (weather.windSpeed > (speedLabel === 'm/s' ? 10 : 22)) {
    parts.push(`Strong winds of ${weather.windSpeed}${speedLabel} — secure loose items outdoors.`);
  }

  
  if (forecast && forecast.length > 0) {
    const tomorrow = forecast[1];
    if (tomorrow) {
      parts.push(`Tomorrow: ${tomorrow.condition} with ${tomorrow.tempMin}-${tomorrow.tempMax}${unitLabel}.`);
    }
  }

 
  const activities = {
    Clear: '☀️ Great day for outdoor activities!',
    Clouds: '⛅ Good conditions for a walk.',
    Rain: '🌧️ Bring an umbrella if going out.',
    Thunderstorm: '⛈️ Stay indoors if possible.',
    Snow: '❄️ Dress warmly and drive carefully.',
    Drizzle: '🌦️ Light rain — a jacket will do.',
    Mist: '🌫️ Reduced visibility — drive carefully.',
  };
  parts.push(activities[weather.condition] || '🌡️ Check conditions before heading out.');

  return parts.join(' ');
}

export default router;
