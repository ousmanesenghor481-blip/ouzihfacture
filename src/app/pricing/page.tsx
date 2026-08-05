'use client';

import { PLANS, PlanKey } from '@/lib/plan';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useApp } from '@/context/AppContext';
import { Lock } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { userRole } = useApp();
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>('Composant PricingPage prêt. En attente d\'action...');

  if (userRole === 'employee') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-8 rounded-2xl shadow-card">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-2">Accès réservé au propriétaire</h2>
          <p className="text-sm text-amber-800 leading-relaxed">
            La souscription et la modification des plans d&apos;abonnement sont réservées au compte propriétaire.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubscribe(planKey: PlanKey) {
    console.log('=== [Pricing Page] HANDLE SUBSCRIBE DÉCLENCHÉ ===', planKey);
    const timeStr = new Date().toLocaleTimeString();
    setDebugLog(`[${timeStr}] Clic détecté sur le plan: "${planKey}". Initialisation...`);

    setLoading(planKey);
    setErrorMsg(null);

    try {
      console.log('[Pricing Page] Envoi de la requête POST vers /api/subscribe...');
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      console.log('[Pricing Page] Statut de réponse HTTP:', response.status);
      const data = await response.json();
      console.log('[Pricing Page] Données reçues du serveur:', data);

      if (response.status === 401) {
        const msg = data.error || 'Veuillez vous connecter pour souscrire un abonnement.';
        console.warn('[Pricing Page] Utilisateur non authentifié:', msg);
        setErrorMsg(msg);
        setDebugLog(`[${timeStr}] Non connecté: ${msg}`);
        alert(msg);
        router.push('/login');
        return;
      }

      if (data.redirect_url) {
        console.log('[Pricing Page] Redirection vers PayTech:', data.redirect_url);
        setDebugLog(`[${timeStr}] Redirection vers PayTech : ${data.redirect_url}`);
        window.location.href = data.redirect_url;
      } else {
        const message = data.error || 'Erreur lors de la création du paiement';
        console.error('[Pricing Page] Erreur renvoyée par le serveur:', message);
        setErrorMsg(message);
        setDebugLog(`[${timeStr}] Erreur serveur : ${message}`);
        alert(`Erreur: ${message}`);
      }
    } catch (error: any) {
      console.error('[Pricing Page] Exception lors de fetch:', error);
      const message = error?.message || 'Erreur lors de la connexion au serveur';
      setErrorMsg(message);
      setDebugLog(`[${timeStr}] Exception : ${message}`);
      alert(`Exception: ${message}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Choisissez votre plan</h1>
      <p className="text-center text-gray-500 mb-6">
        Débloquez toutes les fonctionnalités de votre logiciel de facturation
      </p>

      {/* Live Debug Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 text-xs font-mono shadow-md">
        <div className="text-slate-400 font-bold mb-1 uppercase tracking-wider">🟢 Journal d&apos;exécution en direct :</div>
        <div className="text-emerald-400 font-semibold">{debugLog}</div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm animate-fade-in">
          <div className="font-bold mb-1">⚠️ Impossible d&apos;initialiser le paiement :</div>
          <div>{errorMsg}</div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {(Object.keys(PLANS) as PlanKey[]).map((key) => {
          const plan = PLANS[key];
          const isCurrentLoading = loading === key;

          return (
            <div
              key={key}
              className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all bg-white flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-3xl font-extrabold text-blue-600 my-3">
                  {plan.price.toLocaleString()} {plan.currency}
                  <span className="text-sm font-normal text-gray-500"> / mois</span>
                </p>
                <ul className="my-6 space-y-2.5 text-gray-600">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubscribe(key);
                }}
                disabled={loading !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl disabled:opacity-50 transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                {isCurrentLoading ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    <span>Initialisation PayTech...</span>
                  </>
                ) : (
                  `Choisir le plan ${plan.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
