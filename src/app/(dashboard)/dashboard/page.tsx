'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, FileText, Send, FilePen, CircleCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentInvoicesTable } from '@/components/dashboard/RecentInvoicesTable';
import { QuotaUsageCard } from '@/components/dashboard/QuotaUsageCard';
import { mockChartData } from '@/data/mock';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { stats } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <Link 
          href="/invoices/new" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Créer une facture
        </Link>
      </div>

      {/* Tenant Quota Usage Banner */}
      <QuotaUsageCard />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toutes les factures"
          value={stats.totalInvoices.toString()}
          icon={<FileText className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ value: 8, isPositive: true }}
          chartData={mockChartData.totalInvoices}
          chartColor="#2563eb"
        />
        <StatCard
          title="Factures envoyées"
          value={stats.sentCount.toString()}
          icon={<Send className="w-5 h-5" />}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
          trend={{ value: 5, isPositive: false }}
          chartData={mockChartData.newInvoices}
          chartColor="#16a34a"
        />
        <StatCard
          title="Brouillons"
          value={stats.draftCount.toString()}
          icon={<FilePen className="w-5 h-5" />}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ value: 9, isPositive: true }}
          chartData={mockChartData.draftInvoices}
          chartColor="#ea580c"
        />
        <StatCard
          title="Factures payées"
          value={stats.paidCount.toString()}
          icon={<CircleCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ value: 3, isPositive: false }}
          chartData={mockChartData.paidInvoices}
          chartColor="#059669"
        />
      </div>

      {/* Recent Invoices */}
      <div>
        <RecentInvoicesTable />
      </div>
    </div>
  );
}
