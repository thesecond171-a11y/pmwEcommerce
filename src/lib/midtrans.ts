import crypto from 'crypto';

export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCustomer {
  first_name: string;
  email: string;
  phone: string;
  billing_address?: {
    first_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code?: string;
  };
}

export interface CreateSnapTokenParams {
  orderId: string;
  grossAmount: number;
  customerDetails: MidtransCustomer;
  itemDetails: MidtransItem[];
}

export function isMidtransConfigured(): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  return Boolean(
    serverKey &&
    !serverKey.includes('demo') &&
    !serverKey.includes('your-sandbox')
  );
}

export async function createMidtransSnapToken(params: CreateSnapTokenParams) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

  if (!isMidtransConfigured() || !serverKey) {
    // Generate functional mock snap token for seamless demonstration
    return {
      token: `demo-snap-${params.orderId}-${Date.now()}`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/demo-token`,
      isMock: true,
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const midtransClient = require('midtrans-client');
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
    });

    const transactionParameters = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      customer_details: params.customerDetails,
      item_details: params.itemDetails.map((item) => ({
        id: item.id.substring(0, 50),
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders`,
      },
    };

    const transaction = await snap.createTransaction(transactionParameters);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      isMock: false,
    };
  } catch (error) {
    console.error('Midtrans Snap creation error:', error);
    // Fallback to mock token so user demo doesn't get blocked
    return {
      token: `fallback-snap-${params.orderId}-${Date.now()}`,
      redirect_url: '',
      isMock: true,
      error: error instanceof Error ? error.message : 'Unknown Midtrans error',
    };
  }
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
  serverKey: string = process.env.MIDTRANS_SERVER_KEY || ''
): boolean {
  if (!serverKey) return true; // In demo mode, bypass
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');
  return hash === signatureKey;
}

