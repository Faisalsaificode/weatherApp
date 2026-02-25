'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { weatherApi, citiesApi, aiApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CityCard from '@/components/weather/CityCard';
import AddCityModal from '@/components/weather/AddCityModal';
import AIInsightsPanel from '@/components/ai/AIInsightsPanel';
import AlertsBanner from '@/components/ai/AlertsBanner';

interface DashboardItem {
  city: {
    id: string;
    name: string;
    country: string;
    lat: number;
    lon: number;
    isFavorite: boolean;
    addedAt: string;
  };
  weather: any;
  error: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCity, setShowAddCity] = useState(false);
  const [selectedCity, setSelectedCity] = useState<DashboardItem | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await weatherApi.getDashboard();
      setDashboardData(res.data.data);
    } catch {
      toast.error('Failed to load weather data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await aiApi.getAlerts();
      setAlerts(res.data.alerts);
    } catch {
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      fetchAlerts();
    }
  }, [isAuthenticated, fetchDashboard, fetchAlerts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    toast.success('Weather data refreshed!');
  };

  const handleToggleFavorite = async (cityId: string) => {
    try {
      await citiesApi.toggleFavorite(cityId);
      setDashboardData((prev) =>
        prev
          .map((item) =>
            item.city.id === cityId
              ? { ...item, city: { ...item.city, isFavorite: !item.city.isFavorite } }
              : item
          )
          .sort((a, b) => {
            if (a.city.isFavorite && !b.city.isFavorite) return -1;
            if (!a.city.isFavorite && b.city.isFavorite) return 1;
            return 0;
          })
      );
    } catch {
      toast.error('Failed to update favorite.');
    }
  };

  const handleRemoveCity = async (cityId: string) => {
    try {
      await citiesApi.remove(cityId);
      setDashboardData((prev) => prev.filter((item) => item.city.id !== cityId));
      if (selectedCity?.city.id === cityId) setSelectedCity(null);
      toast.success('City removed from dashboard.');
    } catch {
      toast.error('Failed to remove city.');
    }
  };

  const handleCityAdded = () => {
    setShowAddCity(false);
    setLoading(true);
    fetchDashboard();
    toast.success('City added to your dashboard!');
  };

  const favorites = dashboardData.filter((d) => d.city.isFavorite);
  const nonFavorites = dashboardData.filter((d) => !d.city.isFavorite);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <Navbar onLogout={logout} user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alerts.length > 0 && <AlertsBanner alerts={alerts} />}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {dashboardData.length === 0
                ? 'Add your first city to get started'
                : `Tracking ${dashboardData.length} cit${dashboardData.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              Refresh
            </button>
            <button onClick={() => setShowAddCity(true)} className="btn-primary flex items-center gap-2">
              <span>+</span> Add City
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400">Loading your weather dashboard...</p>
          </div>
        ) : dashboardData.length === 0 ? (
          <EmptyState onAdd={() => setShowAddCity(true)} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
            <div className="xl:col-span-2 space-y-6">
         
              {favorites.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    ⭐ Favorites
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((item) => (
                      <CityCard
                        key={item.city.id}
                        item={item}
                        onToggleFavorite={handleToggleFavorite}
                        onRemove={handleRemoveCity}
                        onSelect={() => setSelectedCity(item)}
                        isSelected={selectedCity?.city.id === item.city.id}
                        unit={user?.temperatureUnit || 'celsius'}
                      />
                    ))}
                  </div>
                </section>
              )}
              {nonFavorites.length > 0 && (
                <section>
                  {favorites.length > 0 && (
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      🌍 Other Cities
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nonFavorites.map((item) => (
                      <CityCard
                        key={item.city.id}
                        item={item}
                        onToggleFavorite={handleToggleFavorite}
                        onRemove={handleRemoveCity}
                        onSelect={() => setSelectedCity(item)}
                        isSelected={selectedCity?.city.id === item.city.id}
                        unit={user?.temperatureUnit || 'celsius'}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
            <div className="xl:col-span-1">
              <AIInsightsPanel selectedCity={selectedCity} />
            </div>
          </div>
        )}
      </main>
      {showAddCity && (
        <AddCityModal onClose={() => setShowAddCity(false)} onAdded={handleCityAdded} />
      )}
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-7xl mb-6 weather-icon-float">🌍</div>
      <h2 className="text-2xl font-bold text-white mb-2">No cities yet</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        Add cities to your dashboard and get real-time weather updates with AI-powered insights.
      </p>
      <button onClick={onAdd} className="btn-primary text-lg px-8 py-3">
        Add Your First City
      </button>
    </div>
  );
}
