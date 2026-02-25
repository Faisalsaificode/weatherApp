'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { citiesApi } from '@/lib/api';

interface SearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface AddCityModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddCityModal({ onClose, onAdded }: AddCityModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await citiesApi.search(query.trim());
        setResults(res.data.results);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Search failed.');
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleAdd = async (city: SearchResult) => {
    const key = `${city.lat}_${city.lon}`;
    setAdding(key);
    try {
      await citiesApi.add({
        name: city.name,
        country: city.state ? `${city.state}, ${city.country}` : city.country,
        countryCode: city.country,
        lat: city.lat,
        lon: city.lon,
      });
      onAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add city.');
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md glass-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Add a City</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="input-field pl-10"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin block" />
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !searching && (
            <p className="text-center text-slate-400 py-8 text-sm">No cities found for &ldquo;{query}&rdquo;</p>
          )}
          {query.length < 2 && (
            <p className="text-center text-slate-500 py-8 text-sm">Type at least 2 characters to search</p>
          )}
          {results.map((city, idx) => {
            const key = `${city.lat}_${city.lon}`;
            const isAdding = adding === key;
            return (
              <button
                key={idx}
                onClick={() => handleAdd(city)}
                disabled={!!adding}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left border border-white/5 hover:border-white/20 disabled:opacity-50"
              >
                <div>
                  <p className="text-white font-medium">{city.name}</p>
                  <p className="text-slate-400 text-xs">
                    {city.state ? `${city.state}, ` : ''}{city.country} · {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                  </p>
                </div>
                {isAdding ? (
                  <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-slate-400 hover:text-white text-lg">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
