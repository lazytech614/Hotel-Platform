import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Hotel from '../../../../models/Hotel';
import { getAuthUser } from '../../../../lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'Owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const updateData = await request.json();
    
    const updatedHotel = await Hotel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedHotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json({ hotel: updatedHotel });

  } catch (error) {
    console.error('Update hotel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
