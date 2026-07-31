'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useApp } from '@/context/AppContext';
import { Eye, Pencil, Trash2, ArrowRight } from 'lucide-react';

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-600 border-blue-200',
    'bg-emerald-100 text-emerald-600 border-emerald-200',
    'bg-orange-100 text-orange-600 border-orange-200',
    'bg-purple-100 text-purple-600 border-purple-200',
    'bg-pink-100 text-pink-600 border-pink-200',
    'bg-teal-100 text-teal-600 border-teal-200',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const RecentInvoicesTable = () => {
  const { invoices, deleteInvoice } = useApp();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Dernières factures</h3>
          <p className="text-xs text-gray-500 mt-0.5">Activité récente de facturation</p>
        </div>
        <Link
          href="/invoices"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl transition-all hover:bg-blue-100"
        >
          Voir toutes les factures
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold">N° Facture</th>
              <th className="px-6 py-4 font-bold">Client</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Montant total</th>
              <th className="px-6 py-4 font-bold">Statut</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentInvoices.map((invoice, idx) => (
              <tr
                key={invoice.id}
                className="group hover:bg-blue-50/30 transition-colors duration-200"
              >
                <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {invoice.invoice_number}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-transform duration-200 group-hover:scale-105 ${getAvatarColor(invoice.client?.name || '?')}`}>
                      {getInitials(invoice.client?.name || '?')}
                    </div>
                    <span className="font-semibold text-gray-800">{invoice.client?.name || '—'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {formatDate(invoice.issue_date)}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </td>
                <td className="px-6 py-4">
                  <Badge status={invoice.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-100/60 rounded-xl transition-all transform hover:scale-110"
                      title="Voir le détail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/invoices/${invoice.id}/edit`}
                      className="p-2 text-emerald-600 hover:bg-emerald-100/60 rounded-xl transition-all transform hover:scale-110"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(invoice.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100/60 rounded-xl transition-all transform hover:scale-110"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {recentInvoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                  Aucune facture récente trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer la facture"
        message="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
      />
    </div>
  );
};
