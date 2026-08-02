import axios from 'axios';

const PAYTECH_API_URL = 'https://paytech.sn/api/payment/request-payment';

interface PaymentRequest {
  itemName: string;
  itemPrice: number;
  refCommand: string;
  successUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}

export async function createPaytechPayment(params: PaymentRequest) {
  const apiKey = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;
  const env = process.env.PAYTECH_ENV || 'test';

  if (!apiKey || !apiSecret) {
    console.error('[PayTech Error] PAYTECH_API_KEY ou PAYTECH_API_SECRET manque dans les variables d\'environnement.');
  }

  const payload = {
    item_name: params.itemName,
    item_price: String(params.itemPrice),
    currency: 'XOF',
    ref_command: params.refCommand,
    command_name: params.itemName,
    env: env,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    ipn_url: params.ipnUrl,
  };

  console.log('[PayTech Request Payload]', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      PAYTECH_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api_key': apiKey || '',
          'api_secret': apiSecret || '',
          'API_KEY': apiKey || '',
          'API_SECRET': apiSecret || '',
        },
      }
    );

    console.log('[PayTech Response Status]', response.status);
    console.log('[PayTech Response Body]', JSON.stringify(response.data, null, 2));

    if (response.data && (response.data.redirect_url || response.data.redirectUrl)) {
      return {
        redirect_url: response.data.redirect_url || response.data.redirectUrl,
        raw: response.data,
      };
    }

    if (response.data && response.data.success === 0) {
      const detail = JSON.stringify(response.data);
      console.error('[PayTech API Business Error]', detail);
      throw new Error(`PayTech a rejeté la requête: ${detail}`);
    }

    return response.data;
  } catch (error: any) {
    if (error?.response) {
      const status = error.response.status;
      const dataDetails = JSON.stringify(error.response.data, null, 2);
      console.error(`[PayTech HTTP ${status} Error Details]:`, dataDetails);
      throw new Error(`PayTech Erreur HTTP ${status}: ${dataDetails}`);
    }
    
    console.error('[PayTech Network/System Error]:', error?.message || error);
    throw error;
  }
}