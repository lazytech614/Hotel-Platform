import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAuthUser } from '../../../../lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'INR' } = await request.json();

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order }, { status: 200 });

  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
