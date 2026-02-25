import axios from 'axios';
import NodeCache from 'node-cache';

const weatherCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const API_KEY = process.env.OPENWEATHER_API_KEY;

export const searchCities = async (query) => {
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${GEO_URL}/direct`, {
    params: { q: query, limit: 5, appid: API_KEY },
  });

  const results = response.data.map((city) => ({
    name: city.name,
    country: city.country,
    state: city.state,
    lat: parseFloat(city.lat.toFixed(4)),
    lon: parseFloat(city.lon.toFixed(4)),
  }));

  weatherCache.set(cacheKey, results, 3600);
  return results;
};

export const getCurrentWeather = async (lat, lon, units = 'metric') => {
  const cacheKey = `weather_${lat}_${lon}_${units}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${BASE_URL}/weather`, {
    params: { lat, lon, appid: API_KEY, units },
  });

  const data = response.data;
  const result = {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    condition: data.weather[0].main,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    cloudiness: data.clouds.all,
    uvi: null,
    cityName: data.name,
    country: data.sys.country,
    timezone: data.timezone,
    dt: data.dt,
  };

  weatherCache.set(cacheKey, result);
  return result;
};

export const getForecast = async (lat, lon, units = 'metric') => {
  const cacheKey = `forecast_${lat}_${lon}_${units}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: { lat, lon, appid: API_KEY, units, cnt: 40 },
  });

  const daily = {};
  response.data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!daily[date]) {
      daily[date] = {
        date,
        temps: [],
        conditions: [],
        icons: [],
        humidity: [],
        windSpeed: [],
      };
    }
    daily[date].temps.push(item.main.temp);
    daily[date].conditions.push(item.weather[0].main);
    daily[date].icons.push(item.weather[0].icon);
    daily[date].humidity.push(item.main.humidity);
    daily[date].windSpeed.push(item.wind.speed);
  });

  const forecast = Object.values(daily)
    .slice(0, 5)
    .map((day) => ({
      date: day.date,
      tempMin: Math.round(Math.min(...day.temps)),
      tempMax: Math.round(Math.max(...day.temps)),
      condition: day.conditions[Math.floor(day.conditions.length / 2)],
      icon: day.icons[Math.floor(day.icons.length / 2)],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
    }));

  weatherCache.set(cacheKey, forecast);
  return forecast;
};
