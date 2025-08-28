import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Order from '../../../models/Order';
import Hotel from '../../../models/Hotel';
import User from '../../../models/User';
import { getAuthUser } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let analytics: any = {};

    if (user.role === 'Owner') {
      // Owner-specific analytics
      analytics = await getOwnerAnalytics(user.tenantId!);
    } else if (user.role === 'Admin') {
      // Platform-wide analytics
      analytics = await getPlatformAnalytics();
    } else if (user.role === 'SalesAgent') {
      // Sales analytics
      analytics = await getSalesAnalytics();
    } else {
      // Customer analytics (order history, preferences)
      analytics = await getCustomerAnalytics(user._id.toString());
    }

    return NextResponse.json(analytics, { status: 200 });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Owner Analytics
async function getOwnerAnalytics(tenantId: string) {
  const today = new Date();
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get hotel for this tenant
  const hotel = await Hotel.findOne({ tenantId });
  if (!hotel) {
    return { error: 'Hotel not found' };
  }

  // Get orders for this tenant
  const orders = await Order.find({ tenantId });
  const recentOrders = await Order.find({ 
    tenantId, 
    createdAt: { $gte: last30Days } 
  });

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.hotelEarnings, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by day (last 7 days)
  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.hotelEarnings, 0);
    
    revenueChart.push({
      date: date.toISOString().split('T')[0],
      revenue: dayRevenue,
      orders: dayOrders.length
    });
  }

  // Hot vs Not items analysis
  const menuAnalytics = analyzeMenuPerformance(hotel.menu, orders);

  // Calculate failure risk
  const failureRisk = calculateFailureRisk(orders, hotel, last30Days);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    recentOrdersCount: recentOrders.length,
    revenueChart,
    menuAnalytics,
    failureRisk: failureRisk.score,
    failureReasons: failureRisk.reasons,
    recommendations: failureRisk.recommendations,
    breakeven: {
      target: 50000, // Example monthly target
      current: totalRevenue,
      percentage: Math.min((totalRevenue / 50000) * 100, 100)
    }
  };
}

// Platform Analytics (Admin)
async function getPlatformAnalytics() {
  const totalUsers = await User.countDocuments();
  const totalHotels = await Hotel.countDocuments();
  const activeHotels = await Hotel.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();
  
  const orders = await Order.find({});
  const platformRevenue = orders.reduce((sum, order) => sum + order.platformEarnings, 0);

  const today = new Date();
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentOrders = await Order.find({ createdAt: { $gte: last30Days } });
  const recentUsers = await User.find({ createdAt: { $gte: last30Days } });

  return {
    totalUsers,
    totalHotels,
    activeHotels,
    totalOrders,
    platformRevenue,
    newUsersThisMonth: recentUsers.length,
    ordersThisMonth: recentOrders.length,
    avgCommissionRate: 30, // 30%
    topPerformingHotels: await getTopPerformingHotels()
  };
}

// Sales Analytics
async function getSalesAnalytics() {
  const hotels = await Hotel.find({});
  const orders = await Order.find({});
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.platformEarnings, 0);
  const activeSubscriptions = hotels.filter(h => h.subscriptionStatus === 'active').length;
  const monthlyRecurring = hotels
    .filter(h => h.subscriptionStatus === 'active' && h.subscriptionPlan === 'monthly')
    .length * 1000; // ₹1000 per month

  return {
    totalRevenue,
    activeSubscriptions,
    monthlyRecurring,
    conversionRate: 75, // Example conversion rate
    churnRate: 5, // Example churn rate
    subscriptions: hotels.map(hotel => ({
      id: hotel._id,
      hotelName: hotel.name,
      plan: hotel.subscriptionPlan,
      status: hotel.subscriptionStatus,
      amount: hotel.subscriptionPlan === 'monthly' ? 1000 : 12000,
      nextPayment: hotel.subscriptionEndDate
    }))
  };
}

// Customer Analytics
async function getCustomerAnalytics(customerId: string) {
  const orders = await Order.find({ customerId });
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  return {
    totalOrders: orders.length,
    totalSpent,
    avgOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
    favoriteCategories: getFavoriteCategories(orders),
    orderHistory: orders.slice(-10) // Last 10 orders
  };
}

// Helper Functions
function analyzeMenuPerformance(menu: any[], orders: any[]) {
  const itemStats = new Map();
  
  // Initialize stats for all menu items
  menu.forEach(item => {
    itemStats.set(item.id, {
      name: item.name,
      category: item.category,
      price: item.price,
      orderCount: 0,
      revenue: 0,
      rating: 4.2 // Default rating
    });
  });
  
  // Calculate stats from orders
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const stats = itemStats.get(item.menuItemId);
      if (stats) {
        stats.orderCount += item.quantity;
        stats.revenue += item.price * item.quantity;
      }
    });
  });
  
  const itemArray = Array.from(itemStats.values());
  
  return {
    hotItems: itemArray
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5),
    notItems: itemArray
      .filter(item => item.orderCount === 0)
      .slice(0, 5),
    topRevenue: itemArray
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  };
}

function calculateFailureRisk(orders: any[], hotel: any, last30Days: Date) {
  const recentOrders = orders.filter(order => new Date(order.createdAt) >= last30Days);
  const recentRevenue = recentOrders.reduce((sum, order) => sum + order.hotelEarnings, 0);
  
  let riskScore = 0;
  const reasons = [];
  const recommendations = [];
  
  // Low revenue risk
  if (recentRevenue < 10000) {
    riskScore += 0.3;
    reasons.push('Low monthly revenue');
    recommendations.push('Consider promotional offers');
  }
  
  // Low order frequency
  if (recentOrders.length < 20) {
    riskScore += 0.2;
    reasons.push('Low order frequency');
    recommendations.push('Improve marketing reach');
  }
  
  // High expenses
  const totalExpenses = hotel.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  if (totalExpenses > recentRevenue * 0.7) {
    riskScore += 0.3;
    reasons.push('High operational expenses');
    recommendations.push('Optimize operational costs');
  }
  
  // Staff cost issues
  const totalSalaries = hotel.staff?.reduce((sum: number, staff: any) => sum + staff.salary, 0) || 0;
  if (totalSalaries > recentRevenue * 0.4) {
    riskScore += 0.2;
    reasons.push('High staff costs');
    recommendations.push('Review staff allocation');
  }
  
  return { score: riskScore, reasons, recommendations };
}

async function getTopPerformingHotels() {
  const hotels = await Hotel.find({ isActive: true }).limit(10);
  const hotelsWithStats = await Promise.all(
    hotels.map(async (hotel) => {
      const orders = await Order.find({ hotelId: hotel._id });
      const revenue = orders.reduce((sum, order) => sum + order.hotelEarnings, 0);
      return {
        id: hotel._id,
        name: hotel.name,
        revenue,
        orders: orders.length
      };
    })
  );
  
  return hotelsWithStats
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function getFavoriteCategories(orders: any[]) {
  const categoryCount = new Map();
  
  orders.forEach(order => {
    order.items.forEach((item: any) => {
      const category = item.category || 'Other';
      categoryCount.set(category, (categoryCount.get(category) || 0) + item.quantity);
    });
  });
  
  return Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));
}
