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

  if (!apiKey || !apiSecret) {
    console.error('[PayTech Error] PAYTECH_API_KEY ou PAYTECH_API_SECRET manque dans les variables d\'environnement.');
  }

  try {
    const response = await axios.post(
      PAYTECH_API_URL,
      {
        item_name: params.itemName,
        item_price: params.itemPrice,
        currency: 'XOF',
        ref_command: params.refCommand,
        command_name: params.itemName,
        env: process.env.PAYTECH_ENV || 'test',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        ipn_url: params.ipnUrl,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          API_KEY: apiKey || '',
          API_SECRET: apiSecret || '',
        },
      }
    );

    console.log('[PayTech Response]', response.data);

    if (response.data && response.data.redirect_url) {
      return response.data;
    }

    if (response.data && response.data.success === 0) {
      const errorMsg = Array.isArray(response.data.errors) 
        ? response.data.errors.join(', ') 
        : (response.data.message || JSON.stringify(response.data));
      throw new Error(`PayTech API Refusal: ${errorMsg}`);
    }

    return response.data;
  } catch (error: any) {
    console.error('[PayTech Request Failed]', error?.response?.data || error?.message || error);
    throw error;
  }
}