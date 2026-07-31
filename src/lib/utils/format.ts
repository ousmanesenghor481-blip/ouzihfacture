// ============================================
// Formatage — Montants FCFA & Dates
// ============================================

/**
 * Formate un montant en FCFA
 * Ex: 250000 → "250 000 FCFA"
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} FCFA`;
}

/**
 * Formate un montant en version courte
 * Ex: 1500000 → "1,5M FCFA"
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    const value = amount / 1000000;
    return `${value % 1 === 0 ? value : value.toFixed(1)}M FCFA`;
  }
  if (amount >= 1000) {
    const value = amount / 1000;
    return `${value % 1 === 0 ? value : value.toFixed(0)}K FCFA`;
  }
  return formatCurrency(amount);
}

/**
 * Formate une date en JJ/MM/AAAA
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formate une date en version courte : "28 Juil 2024"
 */
export function formatDateShort(dateString: string): string {
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];
  const date = new Date(dateString);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Formate une date relative : "Il y a 2 jours"
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  return formatDateShort(dateString);
}

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Retourne la date dans 30 jours au format ISO
 */
export function thirtyDaysFromNowISO(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}
