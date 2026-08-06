import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { fullName, companyName, email, password } = await request.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    let userId: string | null = null;

    if (adminSupabase) {
      // Admin client mode: create user with auto email confirmation
      const { data: userData, error: createErr } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          company_name: companyName,
        },
      });

      if (createErr) {
        console.warn('[Register API] Admin createUser notice:', createErr);
        const msg = createErr.message || String(createErr);
        if (msg.includes('already registered') || msg.includes('already exists') || createErr.status === 422) {
          return NextResponse.json(
            { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' },
            { status: 400 }
          );
        }
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      userId = userData.user?.id || null;

      if (userId) {
        // Provision multi-tenant records using Service Role Key
        const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entreprise';
        const slug = `${cleanCompany}-${userId.slice(0, 8)}`;

        await adminSupabase.from('tenants').upsert({ id: userId, name: companyName, slug, owner_user_id: userId }, { onConflict: 'id' });
        await adminSupabase.from('profiles').upsert({ id: userId, full_name: fullName, email, role: 'owner', tenant_id: userId }, { onConflict: 'id' });
        await adminSupabase.from('company_settings').upsert({ user_id: userId, company_name: companyName, company_email: email }, { onConflict: 'user_id' });
        await adminSupabase.from('tenant_quotas').upsert({ user_id: userId, tenant_id: userId, max_invoices: 5, invoices_used: 0 }, { onConflict: 'user_id' });
      }
    } else {
      // Standard server client fallback mode
      const supabase = createServerSupabase();
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });

      if (signUpErr) {
        return NextResponse.json({ error: signUpErr.message }, { status: 400 });
      }

      userId = signUpData.user?.id || null;
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès.',
      userId,
    });
  } catch (err: any) {
    console.error('[Register API] Catch fatal error:', err);
    const msg = typeof err === 'string' ? err : err?.message || 'Erreur serveur lors de l\'inscription.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
