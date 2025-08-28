import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Hotel from '../../../models/Hotel';
import { getAuthUser } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'Owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name, address, phone, email, deliveryRadius } = await request.json();

    if (!name || !address) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
    }

    const hotel = new Hotel({
      name,
      address,
      phone: phone || '',
      email: email || user.email,
      deliveryRadius: deliveryRadius || 5,
      ownerId: user._id.toString(),
      tenantId: user.tenantId,
      menu: [],
      staff: [],
      expenses: [],
      subscriptionPlan: 'monthly',
      subscriptionStatus: 'active',
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    });

    await hotel.save();

    console.log('Hotel created successfully:', hotel._id);
    return NextResponse.json({ hotel }, { status: 201 });

  } catch (error) {
    console.error('Create hotel error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also add GET method for fetching hotels
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let hotels;
    if (user.role === 'Admin') {
      hotels = await Hotel.find({});
    } else if (user.role === 'Owner') {
      hotels = await Hotel.find({ tenantId: user.tenantId });
    } else {
      hotels = await Hotel.find({ isActive: true });
    }

    return NextResponse.json({ hotels }, { status: 200 });

  } catch (error) {
    console.error('Get hotels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
