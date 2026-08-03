import { createClient } from '@/lib/supabase/client';
import type { PlanKey } from '@/lib/plan';

export interface UserQuotaStats {
  plan: PlanKey;
  monthlyInvoicesCount: number;
  maxInvoices: number | typeof Infinity;
  totalClientsCount: number;
  maxClients: number | typeof Infinity;
}

export async function getUserQuotaStats(userId: string): Promise<UserQuotaStats> {
  const supabase = createClient();

  // 1. Get active plan from subscriptions table
  let activePlan: PlanKey = 'basique';
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (sub && (sub.plan === 'pro' || sub.plan === 'basique')) {
      activePlan = sub.plan as PlanKey;
    }
  } catch (err) {
    console.warn('[Quotas] Error fetching active subscription:', err);
  }

  if (activePlan === 'pro') {
    return {
      plan: 'pro',
      monthlyInvoicesCount: 0,
      maxInvoices: Infinity,
      totalClientsCount: 0,
      maxClients: Infinity,
    };
  }

  // 2. Compute start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 3. Count invoices created since start of current month
  let monthlyInvoicesCount = 0;
  try {
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth);

    monthlyInvoicesCount = count || 0;
  } catch (err) {
    console.warn('[Quotas] Error counting monthly invoices:', err);
  }

  // 4. Count total clients for this user
  let totalClientsCount = 0;
  try {
    const { count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    totalClientsCount = count || 0;
  } catch (err) {
    console.warn('[Quotas] Error counting total clients:', err);
  }

  return {
    plan: 'basique',
    monthlyInvoicesCount,
    maxInvoices: 20,
    totalClientsCount,
    maxClients: 10,
  };
}

export async function checkInvoiceQuota(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const stats = await getUserQuotaStats(userId);

  if (stats.plan === 'pro') {
    return { allowed: true };
  }

  if (stats.monthlyInvoicesCount >= 20) {
    return {
      allowed: false,
      error: 'Limite de 20 factures par mois atteinte pour le plan Basique. Passez au plan Pro pour créer des factures illimitées.',
    };
  }

  return { allowed: true };
}

export async function checkClientQuota(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const stats = await getUserQuotaStats(userId);

  if (stats.plan === 'pro') {
    return { allowed: true };
  }

  if (stats.totalClientsCount >= 10) {
    return {
      allowed: false,
      error: 'Limite de 10 clients atteinte pour le plan Basique. Passez au plan Pro pour enregistrer des clients illimités.',
    };
  }

  return { allowed: true };
}
