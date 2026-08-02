import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
const {
  ref_command,
  item_price,
  api_key_sha256,
  api_secret_sha256,
} = body;

const expectedKeyHash = crypto
  .createHash('sha256')
  .update(process.env.PAYTECH_API_KEY!)
  .digest('hex');
const expectedSecretHash = crypto
  .createHash('sha256')
  .update(process.env.PAYTECH_API_SECRET!)
  .digest('hex');

if (
  api_key_sha256 !== expectedKeyHash ||
  api_secret_sha256 !== expectedSecretHash
) {
  return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
}

const now = new Date();
const expiresAt = new Date(now);
expiresAt.setMonth(expiresAt.getMonth() + 1);

const { error } = await supabaseAdmin
  .from('subscriptions')
  .update({
    status: 'active',
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    updated_at: now.toISOString(),
  })
  .eq('provider_ref', ref_command);

if (error) {
  console.error('Erreur mise à jour subscription:', error);
  return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
}

return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur webhook PayTech:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}