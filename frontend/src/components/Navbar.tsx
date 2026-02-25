'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface NavbarProps {
  onLogout: () => void;
  user: any;
}

export default function Navbar({ onLogout, user }: NavbarProps) {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unit, setUnit] = useState(user?.temperatureUnit || 'celsius');

  const handleLogout = () => {
    onLogout();
    router.push('/auth/login');
    toast.success('Logged out successfully.');
  };

  const handleUnitToggle = async () => {
    const newUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    try {
      const res = await authApi.updatePreferences({ temperatureUnit: newUnit });
      setUnit(newUnit);
      updateUser(res.data.user);
      toast.success(`Switched to ${newUnit === 'celsius' ? '°C' : '°F'}`);
     
      window.location.reload();
    } catch {
      toast.error('Failed to update preference.');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
   
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-2xl">🌤️</span>
            <span>WeatherScope</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUnitToggle}
              className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all border border-white/10"
              title="Toggle temperature unit"
            >
              {unit === 'celsius' ? '°C' : '°F'}
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-all text-sm"
              >
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white hidden sm:block">{user?.name?.split(' ')[0]}</span>
                <span className="text-slate-400 text-xs">▼</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-2xl shadow-black/40">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
