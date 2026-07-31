'use client';

import React, { ReactNode } from 'react';
import { MiniChart } from './MiniChart';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  chartData: { name: string; value: number }[];
  chartColor: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  chartData,
  chartColor,
  className,
}) => {
  return (
    <div
      className={cn(
        "group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between overflow-hidden cursor-default",
        className
      )}
    >
      {/* Subtle background glow on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex flex-col relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
              iconBgColor,
              iconColor
            )}
          >
            {icon}
          </div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1.5 group-hover:text-blue-600 transition-colors">
          {value}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center font-bold px-2 py-0.5 rounded-full text-[11px]",
              trend.isPositive
                ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                : "text-rose-700 bg-rose-50 border border-rose-100"
            )}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-400 font-medium truncate">vs mois dernier</span>
        </div>
      </div>

      <div className="w-[105px] h-[65px] flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105">
        <MiniChart data={chartData} color={chartColor} />
      </div>
    </div>
  );
};
