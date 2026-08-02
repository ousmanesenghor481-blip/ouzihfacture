import { NextRequest, NextResponse } from 'next/server';
import { createPaytechPayment } from '@/lib/paytech';
import { PLANS, PlanKey } from '@/lib/plan';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan } = body;

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Plan invalide sélectionné' }, { status: 400 });
    }

    const planKey = plan as PlanKey;
    const selectedPlan = PLANS[planKey];

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Veuillez vous connecter pour souscrire un abonnement' }, { status: 401 });
    }

    const refCommand = `sub_${user.id.slice(0, 8)}_${Date.now()}`;

    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: planKey,
        status: 'inactive',
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        payment_provider: 'paytech',
        provider_ref: refCommand,
      });

    if (subError) {
      console.warn('[DB Subscription Warning]', subError);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3000';

    const payment = await createPaytechPayment({
      itemName: `Abonnement ${selectedPlan.name}`,
      itemPrice: selectedPlan.price,
      refCommand,
      successUrl: `${baseUrl}/dashboard?payment=success`,
      cancelUrl: `${baseUrl}/pricing?payment=cancelled`,
      ipnUrl: `${baseUrl}/api/webhooks/paytech`,
    });

    if (!payment?.redirect_url) {
      console.error('[Subscribe Route Error] PayTech didn\'t return redirect_url:', payment);
      return NextResponse.json({ 
        error: payment?.errors?.[0] || payment?.message || 'PayTech n\'a pas renvoyé d\'URL de redirection. Vérifiez vos clés d\'API PayTech.' 
      }, { status: 500 });
    }

    return NextResponse.json({ redirect_url: payment.redirect_url });
  } catch (error: any) {
    console.error('[Subscribe Route Error]', error?.response?.data || error?.message || error);
    return NextResponse.json({ 
      error: error?.message || 'Erreur lors de la création du paiement PayTech' 
    }, { status: 500 });
  }
}