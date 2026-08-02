'use client';

import { PLANS, PlanKey } from '@/lib/plan';
import { useState } from 'react';

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanKey | null>(null);

  async function handleSubscribe(planKey: PlanKey) {
    setLoading(planKey);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await response.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert('Erreur lors de la création du paiement');
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la création du paiement');
      setLoading(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Choisissez votre plan</h1>
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
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
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
