import { NextRequest, NextResponse } from 'next/server';
import { createPaytechPayment } from '@/lib/paytech';
import { PLANS, PlanKey } from '@/lib/plan';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('----------------------------------------------------');
  console.log('[SUBSCRIBE API] Step 1: Request received at /api/subscribe');

  try {
    const body = await request.json().catch((err) => {
      console.error('[SUBSCRIBE API] Failed to parse JSON body:', err);
      return {};
    });

    const { plan } = body;
    console.log('[SUBSCRIBE API] Step 1.1: Selected plan key:', plan);

    if (!plan || !(plan in PLANS)) {
      console.warn('[SUBSCRIBE API] Invalid plan key provided:', plan);
      return NextResponse.json({ error: 'Plan invalide sélectionné' }, { status: 400 });
    }

    const planKey = plan as PlanKey;
    const selectedPlan = PLANS[planKey];
    console.log('[SUBSCRIBE API] Step 1.2: Selected plan details:', selectedPlan);

    // Step 2: User auth check
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.warn('[SUBSCRIBE API] Supabase getUser error:', userError);
    }

    console.log('[SUBSCRIBE API] Step 2: Authenticated user ID:', user ? user.id : 'NONE (Unauthenticated)');

    if (!user) {
      console.warn('[SUBSCRIBE API] Access denied: User is not authenticated.');
      return NextResponse.json({ 
        error: 'Veuillez vous connecter pour souscrire un abonnement.' 
      }, { status: 401 });
    }

    // Step 3: Database subscription record insertion
    const refCommand = `sub_${user.id.slice(0, 8)}_${Date.now()}`;
    console.log('[SUBSCRIBE API] Step 3: Creating subscription in DB with ref:', refCommand);

    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: planKey,
        status: 'inactive',
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        payment_provider: 'paytech',
        provider_ref: refCommand,
      })
      .select()
      .maybeSingle();

    if (subError) {
      console.warn('[SUBSCRIBE API] Step 3.1 DB Subscription Warning (non-blocking):', subError);
    } else {
      console.log('[SUBSCRIBE API] Step 3.2: DB Subscription created:', subData?.id);
    }

    // Step 4: PayTech request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3000';
    console.log('[SUBSCRIBE API] Step 4: Initiating PayTech payment request with baseUrl:', baseUrl);

    const payment = await createPaytechPayment({
      itemName: `Abonnement ${selectedPlan.name}`,
      itemPrice: selectedPlan.price,
      refCommand,
      successUrl: `${baseUrl}/dashboard?payment=success`,
      cancelUrl: `${baseUrl}/pricing?payment=cancelled`,
      ipnUrl: `${baseUrl}/api/webhooks/paytech`,
      customField: JSON.stringify({ tenant_id: user.id, user_id: user.id, plan: planKey }),
    });

    console.log('[SUBSCRIBE API] Step 5: PayTech response received:', payment);

    if (!payment?.redirect_url) {
      console.error('[SUBSCRIBE API] Step 5.1 Error: PayTech did not return redirect_url:', payment);
      const paytechError = payment?.errors?.[0] || payment?.message || 'PayTech n\'a pas renvoyé d\'URL de redirection. Vérifiez vos clés d\'API PAYTECH_API_KEY et PAYTECH_API_SECRET.';
      return NextResponse.json({ error: paytechError }, { status: 500 });
    }

    console.log('[SUBSCRIBE API] Step 6: Success! Redirecting to PayTech URL:', payment.redirect_url);
    console.log('----------------------------------------------------');
    return NextResponse.json({ redirect_url: payment.redirect_url });

  } catch (error: any) {
    console.error('[SUBSCRIBE API] Fatal Catch Error:', error?.response?.data || error?.message || error);
    console.log('----------------------------------------------------');
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de la création du paiement PayTech' 
    }, { status: 500 });
  }
}