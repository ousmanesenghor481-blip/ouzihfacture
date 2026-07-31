"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2, Filter } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useApp } from "@/context/AppContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { InvoiceStatus } from "@/types";

const statusFilters: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "brouillon", label: "Brouillons" },
  { value: "envoyee", label: "Envoyées" },
  { value: "payee", label: "Payées" },
  { value: "en_retard", label: "En retard" },
];

const statusStyles: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-700",
  envoyee: "bg-amber-100 text-amber-700",
  payee: "bg-green-100 text-green-700",
  en_retard: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  en_retard: "En retard",
};

export default function InvoicesPage() {
  const { invoices, stats, deleteInvoice } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const perPage = 10;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        searchQuery === "" ||
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / perPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId);
      setDeleteId(null);
    }
  };

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarColor(name: string) {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez et suivez toutes vos factures
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="btn-success inline-flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Créer une facture
        </Link>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total factures",
            value: stats.totalInvoices,
            color: "text-primary-600",
          },
          {
            label: "Montant total",
            value: formatCurrency(stats.totalAmount),
            color: "text-green-600",
          },
          {
            label: "Montant payé",
            value: formatCurrency(stats.paidAmount),
            color: "text-emerald-600",
          },
          {
            label: "En attente",
            value: formatCurrency(stats.pendingAmount + stats.overdueAmount),
            color: "text-amber-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-card"
          >
            <p className="text-xs font-medium text-gray-500 mb-1">
              {stat.label}
            </p>
            <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="input pl-10"
              />
            </div>

            {/* Status filter tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap",
                    statusFilter === filter.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header px-4 py-3">N° Facture</th>
                <th className="table-header px-4 py-3">Client</th>
                <th className="table-header px-4 py-3">Date</th>
                <th className="table-header px-4 py-3">Montant</th>
                <th className="table-header px-4 py-3">Statut</th>
                <th className="table-header px-4 py-3">Total TTC</th>
                <th className="table-header px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-8 h-8" />
                      <p className="font-medium">Aucune facture trouvée</p>
                      <p className="text-sm">
                        Essayez de modifier vos filtres
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium",
                            getAvatarColor(invoice.client?.name || "?")
                          )}
                        >
                          {getInitials(invoice.client?.name || "?")}
                        </div>
                        <span className="text-gray-900 font-medium">
                          {invoice.client?.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">
                      {formatDate(invoice.issue_date)}
                    </td>
                    <td className="table-cell font-medium">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={cn(
                          "badge",
                          statusStyles[invoice.status]
                        )}
                      >
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="table-cell font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/invoices/${invoice.id}/edit`}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(invoice.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Affichage {(currentPage - 1) * perPage + 1} à{" "}
              {Math.min(currentPage * perPage, filteredInvoices.length)} sur{" "}
              {filteredInvoices.length} factures
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-ghost px-2 py-1 text-sm disabled:opacity-30"
              >
                ← Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-ghost px-2 py-1 text-sm disabled:opacity-30"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
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
}
