import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import Order from '../../../../../models/Order';
import { getAuthUser } from '../../../../../lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'Owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    
    await connectDB();

    const updatedOrder = await Order.findByIdAndUpdate(
      params.orderId,
      { status, ...(status === 'delivered' ? { actualDeliveryTime: new Date() } : {}) },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: updatedOrder });

  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
