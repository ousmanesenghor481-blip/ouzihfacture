// ============================================
// Calculs de Facture — TVA, Totaux
// ============================================

import type { InvoiceItem } from "@/types";

/**
 * Calcule le total d'une ligne de facture
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

/**
 * Calcule le sous-total (somme des lignes)
 */
export function calculateSubtotal(items: Pick<InvoiceItem, "quantity" | "unit_price">[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unit_price), 0);
}

/**
 * Calcule le montant de la TVA
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100));
}

/**
 * Calcule le total TTC
 */
export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount;
}

/**
 * Génère un numéro de facture
 * Ex: FAC-2024-001
 */
export function generateInvoiceNumber(prefix: string, number: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = number.toString().padStart(3, "0");
  return `${prefix}-${year}-${paddedNumber}`;
}

/**
 * Vérifie si une facture est en retard
 */
export function isOverdue(dueDate: string, status: string): boolean {
  if (status === "payee") return false;
  return new Date(dueDate) < new Date();
}
