import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Order from '../../../../models/Order';
import Hotel from '../../../../models/Hotel';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(
  request: NextRequest, 
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findOne({ orderId: params.orderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user has permission to view this order
    if (user.role === 'Customer' && order.customerId !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get hotel name
    const hotel = await Hotel.findById(order.hotelId);
    const orderWithHotel = {
      ...order.toObject(),
      hotelName: hotel?.name
    };

    return NextResponse.json({ order: orderWithHotel });

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
