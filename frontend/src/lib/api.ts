import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL  as string;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data: { temperatureUnit: string }) =>
    api.patch('/auth/preferences', data),
};

export const citiesApi = {
  getAll: () => api.get('/cities'),
  search: (query: string) => api.get('/cities/search', { params: { q: query } }),
  add: (city: { name: string; country: string; countryCode: string; lat: number; lon: number }) =>
    api.post('/cities', city),
  remove: (id: string) => api.delete(`/cities/${id}`),
  toggleFavorite: (id: string) => api.patch(`/cities/${id}/favorite`),
};
export const weatherApi = {
  getDashboard: () => api.get('/weather/dashboard'),
  getCity: (id: string) => api.get(`/weather/city/${id}`),
};

export const aiApi = {
  getInsights: (cityId: string, question?: string) =>
    api.post('/ai/insights', { cityId, question }),
  getAlerts: () => api.get('/ai/alerts'),
};

export default api;
