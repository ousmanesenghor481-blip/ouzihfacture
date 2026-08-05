'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState('Utilisateur');
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Ousmane Senghor';
        setUserName(name);
        setUserEmail(user.email || '');
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials || 'U');
      }
    }
    getUser();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Spacer for mobile hamburger menu */}
        <div className="w-8 lg:hidden"></div>
        <h2 className="hidden sm:block text-lg font-bold text-gray-800 tracking-tight">
          👋 Bonjour, {userName}!
        </h2>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200"
            placeholder="Rechercher..."
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* SaaS Admin Portal Button (Owner Only) */}
        {userEmail.toLowerCase() === 'ousmanesenghor481@gmail.com' && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-all border border-slate-800"
            title="Accéder au panneau Admin SaaS"
          >
            <span>👑</span>
            <span className="hidden md:inline">Admin SaaS</span>
          </button>
        )}

        <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-1 pr-3 rounded-full bg-gray-50 border border-gray-100">
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-bold text-gray-800 leading-none">{userName}</span>
              <span className="text-xs text-gray-500 mt-1 font-medium truncate max-w-[140px]">{userEmail}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
