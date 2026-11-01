import { NextResponse } from 'next/server';
import { createMidtransSnapToken } from '@/lib/midtrans';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, grossAmount, customerDetails, itemDetails } = body;

    if (!orderId || !grossAmount) {
      return NextResponse.json(
        { error: 'Order ID dan Gross Amount wajib diisi' },
        { status: 400 }
      );
    }

    const result = await createMidtransSnapToken({
      orderId,
      grossAmount,
      customerDetails: customerDetails || {
        first_name: 'Pelanggan',
        email: 'pelanggan@polsri.ac.id',
        phone: '08123456789',
      },
      itemDetails: itemDetails || [
        {
          id: orderId,
          price: grossAmount,
          quantity: 1,
          name: `Pembelian Produk PMW Polsri (${orderId})`,
        },
      ],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API create-snap-token error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat snap token pembayaran' },
      { status: 500 }
    );
  }
}

