export const PLANS = {
  basique: {
    name: 'Basique',
    price: 5000,
    currency: 'XOF',
    features: [
      'Jusqu\'à 20 factures par mois',
      'Jusqu\'à 10 clients',
      'Support par email',
    ],
  },
  pro: {
    name: 'Pro',
    price: 15000,
    currency: 'XOF',
    features: [
      'Factures illimitées',
      'Clients illimités',
      'Support prioritaire',
      'Tableau de bord avancé',
    ],
  },
} as const;
export type PlanKey = keyof typeof PLANS;