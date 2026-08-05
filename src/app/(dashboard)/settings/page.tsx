"use client";

import { useState } from "react";
import {
  Building2,
  Save,
  Upload,
  Globe,
  Receipt,
  Percent,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Lock } from "lucide-react";

export default function SettingsPage() {
  const { companySettings, updateSettings, userRole } = useApp();
  const [saved, setSaved] = useState(false);

  const [companyName, setCompanyName] = useState(companySettings.company_name);
  const [companyAddress, setCompanyAddress] = useState(companySettings.company_address || "");
  const [companyPhone, setCompanyPhone] = useState(companySettings.company_phone || "");
  const [companyEmail, setCompanyEmail] = useState(companySettings.company_email || "");
  const [taxId, setTaxId] = useState(companySettings.tax_id || "");
  const [taxRate, setTaxRate] = useState(companySettings.default_tax_rate.toString());
  const [currency, setCurrency] = useState(companySettings.currency);
  const [invoicePrefix, setInvoicePrefix] = useState(companySettings.invoice_prefix);

  if (userRole === 'employee') {
    return (
      <div className="animate-fade-in max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-8 rounded-2xl shadow-card">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Accès réservé au propriétaire</h2>
          <p className="text-sm text-amber-800 leading-relaxed">
            Les paramètres de l&apos;entreprise et la configuration de facturation sont réservés exclusivement aux comptes administrateurs (propriétaires).
          </p>
        </div>
      </div>
    );
  }

  function handleSave() {
    updateSettings({
      company_name: companyName,
      company_address: companyAddress || null,
      company_phone: companyPhone || null,
      company_email: companyEmail || null,
      tax_id: taxId || null,
      default_tax_rate: parseFloat(taxRate) || 18,
      currency,
      invoice_prefix: invoicePrefix,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez les informations de votre entreprise
        </p>
      </div>

      <div className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Informations de l&apos;entreprise
              </h2>
              <p className="text-xs text-gray-500">
                Ces informations apparaîtront sur vos factures
              </p>
            </div>
          </div>

          {/* Logo upload area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo de l&apos;entreprise
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                Cliquez pour télécharger votre logo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG ou SVG — Max 2 Mo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Building2 className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Nom de l&apos;entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Adresse
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Téléphone
              </label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                NIF / RCCM
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="CI-RCC-2024-B-XXXXX"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Paramètres de facturation
              </h2>
              <p className="text-xs text-gray-500">
                Configurez vos préférences de facturation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Receipt className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Préfixe des factures
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="FAC"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ex: {invoicePrefix}-2024-001
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Percent className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Taux de TVA (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                Devise
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input"
              >
                <option value="FCFA">FCFA (Franc CFA)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar US)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pb-8">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Paramètres sauvegardés !
            </div>
          )}
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            Sauvegarder les paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
