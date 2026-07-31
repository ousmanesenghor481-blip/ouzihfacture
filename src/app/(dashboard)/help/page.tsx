"use client";

import { useState } from "react";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Search,
  ChevronDown,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Factures & TVA",
      q: "Comment créer une facture avec calcul automatique de la TVA ?",
      a: "Rendez-vous dans la section 'Factures', puis cliquez sur 'Créer une facture'. Remplissez les informations du client et vos prestations. Le système calcule automatiquement la TVA à 18% et le total TTC en FCFA.",
    },
    {
      category: "Paramètres & Entreprise",
      q: "Puis-je personnaliser le logo, le préfixe et les infos de mon entreprise ?",
      a: "Oui ! Allez dans 'Paramètres' depuis le menu latéral. Vous pourrez y ajouter votre logo, modifier le nom d'entreprise, les numéros NIF/RCCM, le préfixe de facture (ex: FAC) et votre adresse.",
    },
    {
      category: "Relances & Statuts",
      q: "Comment fonctionne le suivi des factures en retard ?",
      a: "Chaque facture possède un statut : Brouillon, Envoyée, Payée ou En retard. Dès que la date d'échéance d'une facture non réglée est dépassée, elle est automatiquement signalée avec un badge rouge clair.",
    },
    {
      category: "Export & PDF",
      q: "Comment exporter ou imprimer une facture au format PDF ?",
      a: "Dans la liste des factures, cliquez sur l'icône de l'œil pour afficher le détail de la facture. Utilisez le bouton d'impression/téléchargement pour générer un PDF professionnel prêt à être envoyé.",
    },
    {
      category: "Gestion Clients",
      q: "Comment ajouter un nouveau client ?",
      a: "Accédez à la section 'Clients' dans le menu principal et cliquez sur 'Ajouter un client'. Renseignez le nom, l'email, le téléphone et l'adresse. Ce client sera ensuite disponible dans la liste déroulante lors de la création d'une facture.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      searchQuery === "" ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl shadow-blue-600/15 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Centre d&apos;aide & Assistance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Comment pouvons-nous vous aider aujourd&apos;hui ?
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
            Recherchez dans notre base de connaissances ou contactez directement l&apos;équipe support OuzihFacture.
          </p>

          {/* Search bar inside hero */}
          <div className="relative max-w-lg">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question, une fonctionnalité..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg transition-all"
            />
          </div>
        </div>
      </div>

      {/* Support Channels Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
          Canaux de support direct
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Email */}
          <a
            href="mailto:support@ouzihfacture.com"
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  <Clock className="w-3 h-3" />
                  &lt; 24h
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors">
                Support Email
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Envoyez-nous vos questions techniques ou demandes d&apos;assistance.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span className="truncate">support@ouzihfacture.com</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
            </div>
          </a>

          {/* Card 2: Phone & WhatsApp */}
          <a
            href="tel:+2250700000000"
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  <CheckCircle2 className="w-3 h-3" />
                  En direct
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-green-600 transition-colors">
                Téléphone & WhatsApp
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Assistance téléphonique et échange rapide sur WhatsApp.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-green-600">
              <span>+225 07 00 00 00 00</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 shrink-0" />
            </div>
          </a>

          {/* Card 3: Documentation */}
          <Link
            href="/reports"
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  Documentation
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-purple-600 transition-colors">
                Guides & Tutoriels
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Consultez nos articles et vidéos pour maîtriser la facturation.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>Accéder aux guides</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
            </div>
          </Link>
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600" />
              Foire Aux Questions (FAQ)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Réponses instantanées aux questions les plus fréquentes.
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Aucune question ne correspond à votre recherche</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-xl border transition-all duration-300 overflow-hidden",
                    isOpen
                      ? "border-blue-200 bg-blue-50/30 shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-gray-900 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-full shrink-0">
                        {faq.category}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0",
                        isOpen && "transform rotate-180 text-blue-600"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-blue-100/50 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
