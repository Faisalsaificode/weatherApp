'use client';

import { useState } from 'react';

interface CityCardProps {
  item: {
    city: {
      id: string;
      name: string;
      country: string;
      isFavorite: boolean;
    };
    weather: any;
    error: string | null;
  };
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onSelect: () => void;
  isSelected: boolean;
  unit: string;
}

const weatherBgs: Record<string, string> = {
  Clear: 'from-amber-500/20 to-orange-500/10',
  Clouds: 'from-slate-500/20 to-slate-600/10',
  Rain: 'from-blue-600/20 to-blue-800/10',
  Drizzle: 'from-blue-400/20 to-blue-600/10',
  Thunderstorm: 'from-purple-800/20 to-slate-800/10',
  Snow: 'from-blue-100/20 to-indigo-200/10',
  Mist: 'from-gray-400/20 to-gray-600/10',
  Haze: 'from-yellow-600/10 to-gray-600/10',
};

const weatherEmojis: Record<string, string> = {
  Clear: '☀️',
  Clouds: '⛅',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Haze: '🌫️',
  Fog: '🌫️',
  Dust: '🌪️',
  Tornado: '🌪️',
};

export default function CityCard({
  item, onToggleFavorite, onRemove, onSelect, isSelected, unit,
}: CityCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { city, weather, error } = item;

  const condition = weather?.condition || 'Clear';
  const bg = weatherBgs[condition] || 'from-slate-500/20 to-slate-600/10';
  const emoji = weatherEmojis[condition] || '🌡️';
  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  return (
    <div
      onClick={onSelect}
      className={`
        glass-card p-5 cursor-pointer transition-all duration-300 relative overflow-hidden
        bg-gradient-to-br ${bg}
        ${isSelected ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20' : 'hover:bg-white/10'}
      `}
    >
      {city.isFavorite && (
        <div className="absolute top-0 right-0 bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 rounded-bl-xl">
          ⭐ Favorite
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">{city.name}</h3>
          <p className="text-slate-400 text-sm">{city.country}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(city.id); }}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-lg"
            title={city.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {city.isFavorite ? '⭐' : '☆'}
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-slate-400"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 glass-card w-36 py-1 z-10 shadow-xl">
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(city.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                >
                  🗑️ Remove city
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-white">
                {weather.temperature}{unitSymbol}
              </div>
              <p className="text-slate-300 text-sm mt-1 capitalize">{weather.description}</p>
            </div>
            <div className="text-5xl weather-icon-float">{emoji}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            <MetricItem icon="💧" label="Humidity" value={`${weather.humidity}%`} />
            <MetricItem icon="💨" label="Wind" value={`${weather.windSpeed}${unit === 'fahrenheit' ? 'mph' : 'm/s'}`} />
            <MetricItem icon="🌡️" label="Feels" value={`${weather.feelsLike}${unitSymbol}`} />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-base">{icon}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
      <p className="text-slate-500 text-xs">{label}</p>
    </div>
  );
}
