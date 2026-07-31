// ============================================
// Constantes Globales
// ============================================

import type { InvoiceStatus } from "@/types";

export const TVA_RATE = 18;
export const CURRENCY = "FCFA";
export const DEFAULT_INVOICE_PREFIX = "FAC";
export const DEFAULT_COUNTRY = "Côte d'Ivoire";

export const INVOICE_STATUSES: {
  value: InvoiceStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}[] = [
  {
    value: "brouillon",
    label: "Brouillon",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    dotColor: "bg-gray-500",
  },
  {
    value: "envoyee",
    label: "Envoyée",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  {
    value: "payee",
    label: "Payée",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    dotColor: "bg-green-500",
  },
  {
    value: "en_retard",
    label: "En retard",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
  },
];

export function getStatusConfig(status: InvoiceStatus) {
  return INVOICE_STATUSES.find((s) => s.value === status) || INVOICE_STATUSES[0];
}
