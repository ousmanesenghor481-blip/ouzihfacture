'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  isMobile?: boolean;
}

const menuItems = [
  {
    title: 'MENU PRINCIPAL',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Factures', path: '/invoices', icon: FileText },
      { name: 'Clients', path: '/clients', icon: Users },
    ],
  },
  {
    title: 'PRÉFÉRENCES & SUPPORT',
    items: [
      { name: 'Rapports', path: '/reports', icon: BarChart3 },
      { name: 'Paramètres', path: '/settings', icon: Settings },
      { name: 'Aide & Support', path: '/help', icon: HelpCircle },
    ],
  },
];

export function Sidebar({ collapsed = false, onToggle, className, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-100 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 relative h-full select-none",
        collapsed ? "w-[80px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo Brand Header */}
      <div className="flex items-center h-[70px] px-6 border-b border-gray-100 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 w-full group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-bold text-lg shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            O
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900 truncate tracking-tight">
              Ouzih<span className="text-blue-600">Facture</span>
            </span>
          )}
        </Link>
      </div>

      {/* Collapse button (Desktop only) */}
      {!isMobile && onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-500 z-10 transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h3 className="px-3 mb-2.5 text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          "shrink-0 transition-colors duration-200",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Pro Upgrade Card */}
      {!collapsed && (
        <div className="p-5 mb-6 mx-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 shrink-0">
          <div className="font-bold text-sm mb-1.5 flex items-center gap-2">
            <span>Passer Pro</span>
            <span className="text-lg">🚀</span>
          </div>
          <p className="text-xs text-blue-100 mb-4 leading-relaxed font-medium">
            Gérez vos factures avec des analyses détaillées et des exports illimités.
          </p>
          <Link href="/pricing" className="block text-center w-full bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-sm">
            Passer Pro
          </Link>
        </div>
      )}
    </aside>
  );
}
