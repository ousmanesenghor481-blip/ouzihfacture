import { NextRequest, NextResponse } from 'next/server';
import { createPaytechPayment } from '@/lib/paytech';
import { PLANS, PlanKey } from '@/lib/plan';
import { createClient } from '@/lib/supabase/server';
export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
if (!plan || !(plan in PLANS)) {
  return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
}

const planKey = plan as PlanKey;
const selectedPlan = PLANS[planKey];

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
}

const { data: profile } = await supabase
  .from('profiles')
  .select('tenant_id')
  .eq('id', user.id)
  .single();

if (!profile?.tenant_id) {
  return NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 });
}

const refCommand = `sub_${profile.tenant_id}_${Date.now()}`;

const { data: subscription, error: subError } = await supabase
  .from('subscriptions')
  .insert({
    tenant_id: profile.tenant_id,
    plan: planKey,
    status: 'inactive',
    amount: selectedPlan.price,
    currency: selectedPlan.currency,
    payment_provider: 'paytech',
    provider_ref: refCommand,
  })
  .select()
  .single();

if (subError) {
  console.error('Erreur création subscription:', subError);
  return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const payment = await createPaytechPayment({
  itemName: `Abonnement ${selectedPlan.name}`,
  itemPrice: selectedPlan.price,
  refCommand,
  successUrl: `${baseUrl}/dashboard?payment=success`,
  cancelUrl: `${baseUrl}/pricing?payment=cancelled`,
  ipnUrl: `${baseUrl}/api/webhooks/paytech`,
});

return NextResponse.json({ redirect_url: payment.redirect_url });
  } catch (error) {
    console.error('Erreur subscribe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}