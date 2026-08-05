import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export async function getUserRole(userId?: string): Promise<UserRole> {
  const supabase = createClient();

  let targetId = userId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }

  if (!targetId) {
    return 'owner'; // Default fallback
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetId)
      .maybeSingle();

    if (profile && (profile.role === 'owner' || profile.role === 'employee')) {
      return profile.role as UserRole;
    }
  } catch (err) {
    console.warn('[Roles] Error fetching user role:', err);
  }

  return 'owner';
}

export async function isOwner(userId?: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'owner';
}

export async function isEmployee(userId?: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'employee';
}
