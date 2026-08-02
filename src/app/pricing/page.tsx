'use client';

import { PLANS, PlanKey } from '@/lib/plan';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubscribe(planKey: PlanKey) {
    setLoading(planKey);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await response.json();

      if (response.status === 401) {
        alert(data.error || 'Veuillez vous connecter pour souscrire un abonnement.');
        router.push('/login');
        return;
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        const message = data.error || 'Erreur lors de la création du paiement';
        setErrorMsg(message);
        alert(message);
      }
    } catch (error: any) {
      console.error('Subscribe handle error:', error);
      const message = error?.message || 'Erreur lors de la connexion au serveur';
      setErrorMsg(message);
      alert(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Choisissez votre plan</h1>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <strong>Erreur :</strong> {errorMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {(Object.keys(PLANS) as PlanKey[]).map((key) => {
          const plan = PLANS[key];
          return (
            <div key={key} className="border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-2xl font-bold my-2">
                {plan.price.toLocaleString()} {plan.currency}
                <span className="text-sm font-normal"> / mois</span>
              </p>
              <ul className="my-4 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm">- {feature}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(key)}
                disabled={loading === key}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors cursor-pointer"
              >
                {loading === key ? 'Chargement...' : `Choisir ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
