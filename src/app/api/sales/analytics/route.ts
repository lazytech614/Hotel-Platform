import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'SalesAgent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock analytics data
    const analytics = {
      totalRevenue: 125000,
      activeSubscriptions: 45,
      pendingCommissions: 8,
      monthlyRecurring: 35000,
      conversionRate: 75,
      churnRate: 5
    };

    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
