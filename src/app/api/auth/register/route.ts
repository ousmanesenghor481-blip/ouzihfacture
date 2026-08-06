import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fullName, companyName, email, password } = body;

    console.log('[Register API] Received signup request:', {
      fullName,
      companyName,
      email,
      hasPassword: !!password,
      passwordLength: password ? password.length : 0,
    });

    // 1. Validation des champs requis
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      console.warn('[Register API Validation Error] Nom complet manquant');
      return NextResponse.json(
        { error: 'Veuillez saisir votre nom complet.' },
        { status: 400 }
      );
    }

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      console.warn('[Register API Validation Error] Nom de l\'entreprise manquant');
      return NextResponse.json(
        { error: 'Veuillez saisir le nom de votre entreprise.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
      console.warn('[Register API Validation Error] Email invalide:', email);
      return NextResponse.json(
        { error: 'Veuillez saisir une adresse email valide.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      console.warn('[Register API Validation Error] Mot de passe trop court');
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    let userId: string | null = null;

    if (adminSupabase) {
      console.log('[Register API] Attempting admin.createUser for email:', email);
      // Admin client mode: create user with auto email confirmation
      const { data: userData, error: createErr } = await adminSupabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
        },
      });

      if (createErr) {
        console.error('[Register API Error] Supabase admin.createUser failed:', JSON.stringify(createErr, null, 2));
        const msg = createErr.message || String(createErr);
        if (msg.includes('already registered') || msg.includes('already exists') || createErr.status === 422 || (createErr as any).code === 'user_already_exists') {
          return NextResponse.json(
            { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' },
            { status: 400 }
          );
        }
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      userId = userData.user?.id || null;

      if (userId) {
        console.log('[Register API] Provisioning multi-tenant records for user ID:', userId);
        const cleanCompany = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entreprise';
        const slug = `${cleanCompany}-${userId.slice(0, 8)}`;

        const { error: tErr } = await adminSupabase.from('tenants').upsert({ id: userId, name: companyName.trim(), slug, owner_user_id: userId }, { onConflict: 'id' });
        if (tErr) console.warn('[Register API] Tenants upsert warning:', tErr);

        const { error: pErr } = await adminSupabase.from('profiles').upsert({ id: userId, full_name: fullName.trim(), email: email.trim().toLowerCase(), role: 'owner', tenant_id: userId }, { onConflict: 'id' });
        if (pErr) console.warn('[Register API] Profiles upsert warning:', pErr);

        const { error: cErr } = await adminSupabase.from('company_settings').upsert({ user_id: userId, company_name: companyName.trim(), company_email: email.trim().toLowerCase() }, { onConflict: 'user_id' });
        if (cErr) console.warn('[Register API] Company settings upsert warning:', cErr);

        const { error: qErr } = await adminSupabase.from('tenant_quotas').upsert({ user_id: userId, tenant_id: userId, max_invoices: 5, invoices_used: 0 }, { onConflict: 'user_id' });
        if (qErr) console.warn('[Register API] Tenant quotas upsert warning:', qErr);
      }
    } else {
      console.log('[Register API] Falling back to standard server client for email:', email);
      const supabase = createServerSupabase();
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
        },
      });

      if (signUpErr) {
        console.error('[Register API Error] Standard signUp failed:', signUpErr);
        return NextResponse.json({ error: signUpErr.message }, { status: 400 });
      }

      userId = signUpData.user?.id || null;
    }

    console.log('[Register API Success] Successfully registered user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès.',
      userId,
    });
  } catch (err: any) {
    console.error('[Register API Catch Fatal Error]:', err);
    const msg = typeof err === 'string' ? err : err?.message || 'Erreur serveur lors de l\'inscription.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
