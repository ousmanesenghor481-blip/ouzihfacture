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
  try {
    const response = await axios.post(
      PAYTECH_API_URL,
      {
        item_name: params.itemName,
        item_price: params.itemPrice,
        currency: 'XOF',
        ref_command: params.refCommand,
        command_name: params.itemName,
        env: 'test',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        ipn_url: params.ipnUrl,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          API_KEY: process.env.PAYTECH_API_KEY,
          API_SECRET: process.env.PAYTECH_API_SECRET,
        },
      }
    );
return response.data;
  } catch (error) {
    console.error('Erreur PayTech:', error);
    throw error;
  }
}