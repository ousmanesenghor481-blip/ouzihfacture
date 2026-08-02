'use client';

import { PLANS, PlanKey } from '@/lib/plan';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string | null>(null);

  async function handleSubscribe(planKey: PlanKey) {
    console.log('[Pricing Page] Button clicked for plan:', planKey);
    setLoading(planKey);
    setErrorMsg(null);
    setDebugLog(`Envoi de la requête pour le plan "${planKey}"...`);

    try {
      console.log('[Pricing Page] Sending POST request to /api/subscribe...');
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      console.log('[Pricing Page] Response status code:', response.status);
      const data = await response.json();
      console.log('[Pricing Page] Response data:', data);

      if (response.status === 401) {
        const msg = data.error || 'Veuillez vous connecter pour souscrire un abonnement.';
        console.warn('[Pricing Page] User unauthenticated:', msg);
        setErrorMsg(msg);
        alert(msg);
        router.push('/login');
        return;
      }

      if (data.redirect_url) {
        console.log('[Pricing Page] Redirecting to PayTech URL:', data.redirect_url);
        setDebugLog(`Redirection vers PayTech en cours : ${data.redirect_url}`);
        window.location.href = data.redirect_url;
      } else {
        const message = data.error || 'Erreur lors de la création du paiement';
        console.error('[Pricing Page] Error returned:', message);
        setErrorMsg(message);
        setDebugLog(`Échec : ${message}`);
        alert(message);
      }
    } catch (error: any) {
      console.error('[Pricing Page] Fetch Catch Error:', error);
      const message = error?.message || 'Erreur lors de la connexion au serveur';
      setErrorMsg(message);
      setDebugLog(`Exception : ${message}`);
      alert(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Choisissez votre plan</h1>
      <p className="text-center text-gray-500 mb-8">
        Débloquez toutes les fonctionnalités de votre logiciel de facturation
      </p>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm animate-fade-in">
          <div className="font-bold mb-1">⚠️ Impossible d&apos;initialiser le paiement :</div>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Debug Status Box */}
      {debugLog && !errorMsg && (
        <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
          ℹ️ {debugLog}
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
                onClick={() => handleSubscribe(key)}
                disabled={loading !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
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
