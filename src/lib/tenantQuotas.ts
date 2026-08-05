import { createClient } from '@/lib/supabase/client';

export interface TenantQuota {
  max_invoices: number;
  invoices_used: number;
}

export async function getTenantQuota(userId: string): Promise<TenantQuota> {
  const supabase = createClient();

  try {
    // Try querying tenant_quotas by user_id or tenant_id
    const { data, error } = await supabase
      .from('tenant_quotas')
      .select('max_invoices, invoices_used')
      .or(`user_id.eq.${userId},tenant_id.eq.${userId}`)
      .maybeSingle();

    if (data && !error) {
      return {
        max_invoices: data.max_invoices ?? 5,
        invoices_used: data.invoices_used ?? 0,
      };
    }
  } catch (err) {
    console.warn('[TenantQuotas] Could not fetch tenant_quotas from DB, falling back to invoice count:', err);
  }

  // Fallback: count user's invoices
  try {
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      max_invoices: 5,
      invoices_used: count || 0,
    };
  } catch (err) {
    console.warn('[TenantQuotas] Fallback count failed:', err);
  }

  return {
    max_invoices: 5,
    invoices_used: 0,
  };
}
