import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data for now
    const stats = {
      totalUsers: 25,
      newUsersThisMonth: 5,
      activeHotels: 8,
      totalHotels: 10,
      platformRevenue: 125000,
      totalOrders: 342,
      ordersToday: 12
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
