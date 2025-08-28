'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ChefHat,
  Building2,
  Eye,
  Settings,
  Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import OwnerDashboardOverview from '../../../components/dashboard/owner-dashboard-overview';
import MenuManagement from '../../../components/dashboard/menu-management';
import OrderManagement from '../../../components/dashboard/order-management';
import StaffManagement from '../../../components/dashboard/staff-management';
import ExpenseManagement from '../../../components/dashboard/expense-management';
import AddHotelForm from '@/components/forms/add-hotel-form';

export default function OwnerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hotel, setHotel] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Owner' || !token) {
      router.push('/login');
      return;
    }
    
    fetchData();
    
    // Set up real-time updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, router, token]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchHotel(),
        fetchOrders(),
        fetchAnalytics(),
        fetchNotifications()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchHotel = async () => {
    if (!token) {
      console.error('No token available for fetching hotel');
      return;
    }
    
    try {
      console.log('Fetching hotel data...');
      const response = await fetch('/api/hotels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Hotel fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Hotel data received:', data);
        
        if (data.hotels && data.hotels.length > 0) {
          const hotelData = data.hotels[0];
          
          // Ensure all required arrays are initialized
          if (!hotelData.menu) {
            hotelData.menu = [];
          }
          if (!hotelData.staff) {
            hotelData.staff = [];
          }
          if (!hotelData.expenses) {
            hotelData.expenses = [];
          }
          if (!hotelData.branches) {
            hotelData.branches = [];
          }
          
          setHotel(hotelData);
          console.log('Hotel set successfully:', hotelData);
        } else {
          console.warn('No hotels found for this owner');
          setHotel(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch hotel:', errorData);
        setHotel(null);
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
      setHotel(null);
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications - replace with real API
    setNotifications([
      { id: 1, type: 'warning', message: 'High failure risk detected', time: '5 min ago' },
      { id: 2, type: 'info', message: 'New order received', time: '10 min ago' }
    ]);
  };

  // Early return if not authenticated
  if (!isAuthenticated || !user || user.role !== 'Owner' || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">Loading owner dashboard...</div>
          <div className="text-sm text-gray-600">Fetching hotel data...</div>
        </div>
      </div>
    );
  }

  // No hotel state
  if (!hotel) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">No Hotel Found</h2>
              <p className="text-gray-600 mb-6">
                You need to create a hotel first to access the owner dashboard.
              </p>
              <AddHotelForm onHotelAdded={() => {
                // Refresh the page data after hotel is created
                fetchData();
              }} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
            <Badge variant={hotel?.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
              {hotel?.subscriptionStatus || 'inactive'}
            </Badge>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OwnerDashboardOverview 
              hotel={hotel} 
              orders={orders} 
              analytics={analytics} 
              notifications={notifications}
            />
          </TabsContent>

          <TabsContent value="menu">
            <MenuManagement 
              hotel={hotel} 
              onUpdate={fetchHotel} 
              token={token} 
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement 
              orders={orders} 
              onUpdate={fetchOrders} 
              token={token} 
            />
          </TabsContent>

          <TabsContent value="staff">
            <StaffManagement 
              hotel={hotel} 
              onUpdate={fetchHotel} 
              token={token} 
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseManagement 
              hotel={hotel} 
              onUpdate={fetchHotel} 
              token={token} 
            />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-4">Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analytics.revenueChart || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#f97316" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-4">Menu Performance</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-green-600 mb-2">Hot Items 🔥</h4>
                            {analytics.menuAnalytics?.hotItems?.slice(0, 3).map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span>{item.orderCount} orders</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-red-600 mb-2">Needs Attention 📉</h4>
                            {analytics.menuAnalytics?.notItems?.slice(0, 3).map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-red-500">0 orders</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p>Loading analytics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
