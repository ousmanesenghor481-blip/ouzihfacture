"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from "@/lib/utils/invoice";
import { TVA_RATE } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, clients, updateInvoice } = useApp();

  const invoice = invoices.find((inv) => inv.id === params.id);

  const [clientId, setClientId] = useState(invoice?.client_id || "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date || "");
  const [dueDate, setDueDate] = useState(invoice?.due_date || "");
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [items, setItems] = useState<LineItem[]>(
    invoice?.items?.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })) || [{ id: "1", description: "", quantity: 1, unit_price: 0 }]
  );

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

  function addLine() {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  function removeLine(id: string) {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  }

  function updateLine(
    id: string,
    field: keyof LineItem,
    value: string | number
  ) {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  const subtotal = calculateSubtotal(
    items.map((i) => ({ quantity: i.quantity, unit_price: i.unit_price }))
  );
  const taxAmount = calculateTax(subtotal, TVA_RATE);
  const total = calculateTotal(subtotal, taxAmount);

  async function handleSave() {
    const selectedClient = clients.find((c) => c.id === clientId);

    await updateInvoice(invoice!.id, {
      client_id: clientId || null,
      client: selectedClient,
      issue_date: issueDate,
      due_date: dueDate,
      subtotal,
      tax_amount: taxAmount,
      total,
      notes: notes || null,
      items: items.map((i, index) => ({
        id: i.id,
        invoice_id: invoice!.id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: i.quantity * i.unit_price,
        sort_order: index,
      })),
    });

    router.push(`/invoices/${invoice!.id}`);
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/invoices/${invoice.id}`}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier {invoice.invoice_number}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Modifiez les détails de la facture
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client & Dates */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input"
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d&apos;émission
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d&apos;échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary-600" />
              Lignes de facture
            </h2>
            <button
              onClick={addLine}
              className="btn-ghost text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-3 mb-2 px-1">
            <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase">
              Description
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">
              Quantité
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">
              Prix unitaire
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase text-right">
              Total
            </div>
            <div className="col-span-1" />
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const lineTotal = calculateLineTotal(item.quantity, item.unit_price);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                >
                  <div className="md:col-span-5">
                    <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLine(item.id, "description", e.target.value)
                      }
                      placeholder={`Ligne ${index + 1}`}
                      className="input text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLine(item.id, "quantity", parseInt(e.target.value) || 0)
                      }
                      className="input text-sm text-center"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">
                      Prix unitaire (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateLine(item.id, "unit_price", parseInt(e.target.value) || 0)
                      }
                      className="input text-sm text-right"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => removeLine(item.id)}
                      disabled={items.length === 1}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addLine}
            className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-gray-500">TVA ({TVA_RATE}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between w-full border-t border-gray-200 pt-2">
                <span className="text-base font-bold text-gray-900">
                  Total TTC
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Notes (optionnel)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes ou conditions de paiement..."
            className="input resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pb-8">
          <Link
            href={`/invoices/${invoice.id}`}
            className="btn-ghost w-full sm:w-auto"
          >
            Annuler
          </Link>
          <button onClick={handleSave} className="btn-primary w-full sm:w-auto">
            <Save className="w-4 h-4" />
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
