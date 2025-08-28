import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Order from '../../../models/Order';
import Hotel from '../../../models/Hotel';
import { getAuthUser } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let orders;
    if (user.role === 'Admin') {
      orders = await Order.find({});
    } else if (user.role === 'Owner') {
      orders = await Order.find({ tenantId: user.tenantId });
    } else {
      orders = await Order.find({ customerId: user._id });
    }

    return NextResponse.json({ orders }, { status: 200 });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const orderData = await request.json();
    const { hotelId, items, deliveryAddress, customerPhone, paymentMethod } = orderData;

    // Get hotel info for commission calculation
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );

    const commission = totalAmount * 0.30; // 30% commission
    const hotelEarnings = totalAmount - commission;

    const order = new Order({
      orderId: uuidv4(),
      customerId: user._id,
      hotelId,
      tenantId: hotel.tenantId,
      items,
      totalAmount,
      deliveryAddress,
      customerPhone,
      paymentMethod,
      commission,
      hotelEarnings,
      platformEarnings: commission,
      estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    await order.save();

    return NextResponse.json({ order }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
