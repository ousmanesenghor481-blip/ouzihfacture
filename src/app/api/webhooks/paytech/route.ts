import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  console.log('====================================================');
  console.log('[PAYTECH IPN WEBHOOK] Incoming notification received');

  try {
    // 1. Read Payload (formData or json)
    let body: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } else {
      body = await request.json().catch(() => ({}));
    }

    console.log('[PAYTECH IPN WEBHOOK] Body payload:', JSON.stringify(body, null, 2));

    const {
      type_event,
      status,
      ref_command,
      custom_field,
      api_key_sha256,
      api_secret_sha256,
    } = body;

    // 2. Security Verification with PAYTECH_API_KEY & PAYTECH_API_SECRET
    const apiKey = process.env.PAYTECH_API_KEY || '';
    const apiSecret = process.env.PAYTECH_API_SECRET || '';

    const expectedApiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const expectedApiSecretHash = crypto.createHash('sha256').update(apiSecret).digest('hex');

    if (api_secret_sha256 && api_secret_sha256 !== expectedApiSecretHash) {
      console.warn('[PAYTECH IPN SECURITY WARNING] Invalid api_secret_sha256 received from IPN');
    }

    if (api_key_sha256 && api_key_sha256 !== expectedApiKeyHash) {
      console.warn('[PAYTECH IPN SECURITY WARNING] Invalid api_key_sha256 received from IPN');
    }

    // 3. Check Payment Success Condition
    const isSuccessEvent =
      type_event === 'sale_complete' ||
      type_event === 'sale_completed' ||
      status === 'success' ||
      status === 'completed';

    console.log('[PAYTECH IPN WEBHOOK] Is Payment Successful?', isSuccessEvent);

    if (!isSuccessEvent) {
      console.log(`[PAYTECH IPN WEBHOOK] Event "${type_event || status}" is not a successful sale. Ignored.`);
      return NextResponse.json({ success: true, message: 'Event logged and ignored' }, { status: 200 });
    }

    // 4. Extract Tenant / User ID from custom_field or ref_command
    let tenantId: string | null = null;

    if (custom_field) {
      try {
        const parsedCustom = typeof custom_field === 'string' ? JSON.parse(custom_field) : custom_field;
        tenantId = parsedCustom.tenant_id || parsedCustom.user_id || null;
      } catch (e) {
        console.warn('[PAYTECH IPN WEBHOOK] Could not parse custom_field JSON:', custom_field);
      }
    }

    if (!tenantId && ref_command && typeof ref_command === 'string') {
      // ref_command format: sub_<tenant_id>_<timestamp>
      const parts = ref_command.split('_');
      if (parts.length >= 2 && parts[0] === 'sub') {
        tenantId = parts[1];
      }
    }

    console.log('[PAYTECH IPN WEBHOOK] Extracted Tenant ID:', tenantId);

    if (!tenantId) {
      console.error('[PAYTECH IPN WEBHOOK] Error: Could not determine tenant_id from IPN payload');
      return NextResponse.json({ error: 'Missing tenant_id identification' }, { status: 400 });
    }

    // 5. Instantiate Supabase Admin Client (Service Role Key bypassing RLS safely on server)
    const adminSupabase = createAdminClient();

    // 6. Update tenant_quotas table to unlock unlimited invoices (max_invoices = 99999)
    console.log(`[PAYTECH IPN WEBHOOK] Updating tenant_quotas for tenant ${tenantId}...`);
    const { error: quotaError } = await adminSupabase
      .from('tenant_quotas')
      .upsert(
        {
          user_id: tenantId,
          tenant_id: tenantId,
          max_invoices: 99999,
          invoices_used: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (quotaError) {
      console.warn('[PAYTECH IPN WEBHOOK] tenant_quotas update warning:', quotaError);
    } else {
      console.log('[PAYTECH IPN WEBHOOK] tenant_quotas updated successfully with max_invoices: 99999');
    }

    // 7. Update subscriptions table to status = 'active', plan = 'pro'
    console.log(`[PAYTECH IPN WEBHOOK] Updating subscriptions table for tenant ${tenantId}...`);
    const { error: subError } = await adminSupabase
      .from('subscriptions')
      .update({
        status: 'active',
        plan: 'pro',
        updated_at: new Date().toISOString(),
      })
      .or(`user_id.eq.${tenantId},provider_ref.eq.${refCommand}`);

    if (subError) {
      console.warn('[PAYTECH IPN WEBHOOK] subscriptions update warning:', subError);
    } else {
      console.log('[PAYTECH IPN WEBHOOK] subscriptions updated successfully to status: active, plan: pro');
    }

    console.log('[PAYTECH IPN WEBHOOK] Payment processing completed successfully!');
    console.log('====================================================');

    // 8. Return HTTP 200 OK Response to PayTech
    return NextResponse.json(
      { success: true, message: 'PayTech IPN processed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PAYTECH IPN WEBHOOK] Catch Fatal Error:', error?.message || error);
    console.log('====================================================');
    return NextResponse.json({ error: error?.message || 'Server error processing IPN' }, { status: 500 });
  }
}