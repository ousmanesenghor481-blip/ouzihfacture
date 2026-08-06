import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error('[REGISTER 400 ERROR] Impossible de lire le corps JSON de la requête:', parseErr);
      return NextResponse.json(
        { error: 'Format de requête invalide (JSON attendu).' },
        { status: 400 }
      );
    }

    const { fullName, companyName, email, password } = body || {};

    console.log('[REGISTER API] Inscription reçue:', {
      fullName,
      companyName,
      email,
      hasPassword: !!password,
      passwordLen: password ? password.length : 0,
    });

    // 1. Validation : Nom complet
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      console.error('[REGISTER 400 ERROR] Nom complet manquant ou invalide:', { fullName });
      return NextResponse.json(
        { error: 'Veuillez saisir votre nom complet.' },
        { status: 400 }
      );
    }

    // 2. Validation : Nom de l'entreprise
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      console.error('[REGISTER 400 ERROR] Nom de l\'entreprise manquant ou invalide:', { companyName });
      return NextResponse.json(
        { error: 'Veuillez saisir le nom de votre entreprise.' },
        { status: 400 }
      );
    }

    // 3. Validation : Email
    if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
      console.error('[REGISTER 400 ERROR] Adresse email manquante ou format invalide:', { email });
      return NextResponse.json(
        { error: 'Veuillez saisir une adresse email valide.' },
        { status: 400 }
      );
    }

    // 4. Validation : Mot de passe
    if (!password || typeof password !== 'string' || password.length < 6) {
      console.error('[REGISTER 400 ERROR] Mot de passe trop court (< 6 caractères):', { passwordLen: password ? password.length : 0 });
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    let userId: string | null = null;
    let usedAdminMode = false;

    if (adminSupabase) {
      console.log('[REGISTER API] Exécution de admin.createUser pour l\'email:', email);
      
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
        console.error('[REGISTER API WARNING] Supabase admin.createUser a échoué:', JSON.stringify(createErr, null, 2));
        const msg = createErr.message || String(createErr);

        if (msg.includes('already registered') || msg.includes('already exists') || createErr.status === 422 || (createErr as any).code === 'user_already_exists') {
          return NextResponse.json(
            { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' },
            { status: 400 }
          );
        }

        // If AuthRetryableFetchError or 500 error, fallback to standard client signUp
        console.warn('[REGISTER API] AuthRetryableFetchError intercepté, bascule vers le client standard signUp...');
      } else {
        userId = userData.user?.id || null;
        usedAdminMode = true;
      }
    }

    // Fallback standard signUp if admin mode was not used or failed
    if (!userId) {
      console.log('[REGISTER API] Exécution du client standard signUp pour l\'email:', email);
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
        console.error('[REGISTER 400 ERROR] Supabase standard signUp a échoué:', signUpErr);
        const msg = signUpErr.message || String(signUpErr);
        if (msg.includes('already registered') || msg.includes('already exists')) {
          return NextResponse.json(
            { error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: msg || 'Échec de création du compte.' },
          { status: 400 }
        );
      }

      userId = signUpData.user?.id || null;
    }

    if (userId && usedAdminMode && adminSupabase) {
      console.log('[REGISTER API] Provisionnement des tables multi-tenant pour le user ID:', userId);
      const cleanCompany = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entreprise';
      const slug = `${cleanCompany}-${userId.slice(0, 8)}`;

      await adminSupabase.from('tenants').upsert({ id: userId, name: companyName.trim(), slug, owner_user_id: userId }, { onConflict: 'id' });
      await adminSupabase.from('profiles').upsert({ id: userId, full_name: fullName.trim(), email: email.trim().toLowerCase(), role: 'owner', tenant_id: userId }, { onConflict: 'id' });
      await adminSupabase.from('company_settings').upsert({ user_id: userId, company_name: companyName.trim(), company_email: email.trim().toLowerCase() }, { onConflict: 'user_id' });
      await adminSupabase.from('tenant_quotas').upsert({ user_id: userId, tenant_id: userId, max_invoices: 5, invoices_used: 0 }, { onConflict: 'user_id' });
    }

    console.log('[REGISTER API SUCCESS] Inscription réussie pour l\'utilisateur:', userId);

    return NextResponse.json({
      success: true,
      message: 'Compte et entreprise créés avec succès.',
      userId,
    });
  } catch (err: any) {
    console.error('[REGISTER 500 FATAL ERROR] Exception non gérée dans la route d\'inscription:', err);
    const msg = typeof err === 'string' ? err : err?.message || 'Erreur serveur lors de l\'inscription.';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
