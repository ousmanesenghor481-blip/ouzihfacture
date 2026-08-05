'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export function QuotaUsageCard() {
  const { tenantQuota, quotaLoading } = useApp();

  if (quotaLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full w-full mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const maxInvoices = tenantQuota?.max_invoices ?? 5;
  const invoicesUsed = tenantQuota?.invoices_used ?? 0;
  const percentage = Math.min(100, Math.round((invoicesUsed / maxInvoices) * 100));
  const isLimitReached = invoicesUsed >= maxInvoices;

  let progressColor = 'bg-gradient-to-r from-blue-500 to-indigo-600';
  let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (percentage >= 100) {
    progressColor = 'bg-gradient-to-r from-rose-500 to-red-600';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
  } else if (percentage >= 80) {
    progressColor = 'bg-gradient-to-r from-amber-500 to-orange-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            📊
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Consommation du Quota</h3>
            <p className="text-xs text-gray-400">Plan gratuit (Limite mensuelle)</p>
          </div>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
          {isLimitReached ? 'Quota atteint' : `${percentage}% utilisé`}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3.5 bg-gray-100 rounded-full overflow-hidden my-3 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs mt-3">
        <span className="font-medium text-gray-600">
          <strong className="text-gray-900 font-bold">{invoicesUsed}</strong> / {maxInvoices} factures créées
        </span>

        {isLimitReached ? (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            Passer Pro
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-gray-400 font-medium">
            {maxInvoices - invoicesUsed} restante(s)
          </span>
        )}
      </div>
    </div>
  );
}
