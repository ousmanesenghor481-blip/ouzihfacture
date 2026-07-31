"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Download,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useApp } from "@/context/AppContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { InvoiceStatus } from "@/types";

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

const nextStatusMap: Record<InvoiceStatus, InvoiceStatus | null> = {
  brouillon: "envoyee",
  envoyee: "payee",
  payee: null,
  en_retard: "payee",
};

const nextStatusLabels: Record<InvoiceStatus, string> = {
  brouillon: "Marquer comme envoyée",
  envoyee: "Marquer comme payée",
  payee: "",
  en_retard: "Marquer comme payée",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, companySettings, updateInvoice, deleteInvoice } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const invoice = invoices.find((inv) => inv.id === params.id);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <p className="text-lg font-medium text-gray-500 mb-4">
          Facture non trouvée
        </p>
        <Link href="/invoices" className="btn-primary">
          Retour aux factures
        </Link>
      </div>
    );
  }

  const nextStatus = nextStatusMap[invoice.status];

  const handleStatusChange = async () => {
    if (nextStatus) {
      await updateInvoice(invoice.id, { status: nextStatus });
    }
  };

  const handleDelete = async () => {
    await deleteInvoice(invoice.id);
    router.push("/invoices");
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.invoice_number}
              </h1>
              <span
                className={cn("badge text-xs", statusStyles[invoice.status])}
              >
                {statusLabels[invoice.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Créée le {formatDate(invoice.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {nextStatus && (
            <button
              onClick={handleStatusChange}
              className="btn-success text-sm shadow-sm hover:scale-105 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {nextStatusLabels[invoice.status]}
            </button>
          )}
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="btn-secondary text-sm"
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </Link>
          <button
            onClick={() => window.print()}
            className="btn-ghost text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100"
            title="Télécharger / Imprimer la Facture PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Télécharger PDF</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-ghost text-sm text-rose-600 hover:bg-rose-50"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden print:shadow-none print:border-none">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-8 py-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {companySettings.company_name}
              </h2>
              {companySettings.company_address && (
                <p className="text-blue-200 text-sm mt-1">
                  {companySettings.company_address}
                </p>
              )}
              {companySettings.company_phone && (
                <p className="text-blue-200 text-sm">
                  {companySettings.company_phone}
                </p>
              )}
              {companySettings.company_email && (
                <p className="text-blue-200 text-sm">
                  {companySettings.company_email}
                </p>
              )}
              {companySettings.tax_id && (
                <p className="text-blue-200 text-xs mt-1 font-mono">
                  NIF/RCCM : {companySettings.tax_id}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold tracking-tight">FACTURE</p>
              <p className="text-blue-200 text-sm mt-1 font-semibold">
                {invoice.invoice_number}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Client & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Facturer à
                </h3>
              </div>
              <p className="font-bold text-gray-900 text-base">
                {invoice.client?.name || "—"}
              </p>
              {invoice.client?.address && (
                <p className="text-sm text-gray-500">
                  {invoice.client.address}
                </p>
              )}
              {invoice.client?.email && (
                <p className="text-sm text-gray-500">
                  {invoice.client.email}
                </p>
              )}
              {invoice.client?.phone && (
                <p className="text-sm text-gray-500">
                  {invoice.client.phone}
                </p>
              )}
            </div>
            <div className="md:text-right">
              <div className="flex items-center gap-2 md:justify-end mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Dates & Informations
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-500">Date d&apos;émission :</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {formatDate(invoice.issue_date)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Date d&apos;échéance :</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {formatDate(invoice.due_date)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Description
                  </th>
                  <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Quantité
                  </th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Prix unitaire
                  </th>
                  <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(invoice.items || []).map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn(
                      idx % 2 === 1 && "bg-gray-50/40"
                    )}
                  >
                    <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">
                      {item.description}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 text-right font-medium">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  TVA ({invoice.tax_rate}%)
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(invoice.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between text-base border-t border-gray-200 pt-2 mt-2">
                <span className="font-extrabold text-gray-900">Total TTC</span>
                <span className="font-extrabold text-blue-600 text-lg">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Notes & Conditions
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la facture"
        message={`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoice_number} ? Cette action est irréversible.`}
      />
    </div>
  );
}
