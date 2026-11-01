import { NextResponse } from 'next/server';
import { verifyMidtransSignature } from '@/lib/midtrans';

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = notification;

    // Verify Midtrans signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Signature key tidak valid' }, { status: 403 });
    }

    let orderStatus = 'pending_payment';
    let paymentStatus = 'unpaid';

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        orderStatus = 'pending_payment';
        paymentStatus = 'unpaid';
      } else if (fraud_status === 'accept') {
        orderStatus = 'paid';
        paymentStatus = 'paid';
      }
    } else if (transaction_status === 'settlement') {
      orderStatus = 'paid';
      paymentStatus = 'paid';
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      orderStatus = 'cancelled';
      paymentStatus = transaction_status === 'expire' ? 'expired' : 'failed';
    } else if (transaction_status === 'pending') {
      orderStatus = 'pending_payment';
      paymentStatus = 'unpaid';
    }

    // In a live Supabase environment, execute:
    // await supabase.from('orders').update({ status: orderStatus, payment_status: paymentStatus, payment_method: payment_type }).eq('order_number', order_id);

    return NextResponse.json({
      success: true,
      order_id,
      order_status: orderStatus,
      payment_status: paymentStatus,
      payment_type,
    });
  } catch (error) {
    console.error('Midtrans Webhook error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses webhook Midtrans' },
      { status: 500 }
    );
  }
}
