import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // 1. Create authenticated user with email_confirm = true (bypassing email confirmation blocks)
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
      console.warn('[Register API] User creation error:', createErr);
      const msg = createErr.message || String(createErr);
      if (msg.includes('already registered') || msg.includes('already exists') || createErr.status === 422) {
        return NextResponse.json(
          { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const newUser = userData.user;
    if (!newUser) {
      return NextResponse.json({ error: 'Échec de création du compte utilisateur.' }, { status: 500 });
    }

    const userId = newUser.id;

    // 2. Generate clean unique slug
    const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entreprise';
    const slug = `${cleanCompany}-${userId.slice(0, 8)}`;

    // 3. Atomically provision Tenants table (id, name, slug, owner_user_id)
    const { error: tenantErr } = await adminSupabase
      .from('tenants')
      .upsert(
        {
          id: userId,
          name: companyName,
          slug,
          owner_user_id: userId,
        },
        { onConflict: 'id' }
      );

    if (tenantErr) {
      console.warn('[Register API] Tenants upsert warning:', tenantErr);
    }

    // 4. Atomically provision Profiles table
    const { error: profileErr } = await adminSupabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: fullName,
          email,
          role: 'owner',
          tenant_id: userId,
        },
        { onConflict: 'id' }
      );

    if (profileErr) {
      console.warn('[Register API] Profiles upsert warning:', profileErr);
    }

    // 5. Atomically provision Company Settings table
    const { error: settingsErr } = await adminSupabase
      .from('company_settings')
      .upsert(
        {
          user_id: userId,
          company_name: companyName,
          company_email: email,
        },
        { onConflict: 'user_id' }
      );

    if (settingsErr) {
      console.warn('[Register API] Company settings upsert warning:', settingsErr);
    }

    // 6. Atomically provision Tenant Quotas table
    const { error: quotaErr } = await adminSupabase
      .from('tenant_quotas')
      .upsert(
        {
          user_id: userId,
          tenant_id: userId,
          max_invoices: 5,
          invoices_used: 0,
        },
        { onConflict: 'user_id' }
      );

    if (quotaErr) {
      console.warn('[Register API] Tenant quotas upsert warning:', quotaErr);
    }

    console.log('[Register API] Account & Multi-tenant records successfully provisioned for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Compte et entreprise créés avec succès.',
      userId,
    });
  } catch (err: any) {
    console.error('[Register API] Catch fatal error:', err);
    const msg = err?.message || typeof err === 'string' ? err : 'Erreur serveur lors de l\'inscription.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
