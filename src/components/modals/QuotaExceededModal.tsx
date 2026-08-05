'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, X, AlertTriangle } from 'lucide-react';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuotaExceededModal({ isOpen, onClose }: QuotaExceededModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden animate-scale-up">
        {/* Modal Header Icon */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-inner">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Limite de factures atteinte !
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4">
          <p className="text-gray-900 font-bold text-base">
            Vous avez atteint votre limite de factures gratuites.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Votre quota de <strong>5 factures</strong> est intégralement consommé. Pour continuer à créer et envoyer des factures illimitées pour votre entreprise, passez au plan Pro.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-left text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Ce que vous débloquez avec le Plan Pro :
            </div>
            <ul className="space-y-1 text-amber-800 font-medium pl-5 list-disc">
              <li>Création de factures illimitées</li>
              <li>Gestion de clients illimitée</li>
              <li>Exports PDF & Rapports avancés</li>
              <li>Support prioritaire 7j/7</li>
            </ul>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-0 space-y-2.5">
          <Link
            href="/pricing"
            className="w-full btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            Passer à un plan supérieur (Upgrade)
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
