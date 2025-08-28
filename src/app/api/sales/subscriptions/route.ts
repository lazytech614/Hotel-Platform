import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'SalesAgent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data - replace with real database queries
    const subscriptions = [
      {
        id: '1',
        hotelName: 'Grand Palace Hotel',
        ownerName: 'John Doe',
        ownerEmail: 'john@grandpalace.com',
        plan: 'monthly',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-12-15',
        amount: 1000,
        commission: 150
      }
    ];

    return NextResponse.json({ subscriptions });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
