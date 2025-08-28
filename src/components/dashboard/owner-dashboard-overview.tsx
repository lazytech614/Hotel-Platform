'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Eye
} from 'lucide-react';

interface Props {
  hotel: any;
  orders: any[];
  analytics: any;
  notifications: any[];
}

export default function OwnerDashboardOverview({ hotel, orders, analytics, notifications }: Props) {
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => 
      order.createdAt.split('T')[0] === today
    );

    const totalRevenue = orders.reduce((sum, order) => sum + (order.hotelEarnings || 0), 0);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.hotelEarnings || 0), 0);

    return {
      totalRevenue,
      todayRevenue,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      pendingOrders: orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Today: ₹{stats.todayRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Today: {stats.todayOrders} | Pending: {stats.pendingOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotel?.staff?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      {(analytics?.failureRisk > 0.6 || notifications.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics?.failureRisk > 0.6 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  High Failure Risk Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Risk Score: {(analytics.failureRisk * 100).toFixed(0)}%
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reasons:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {analytics.failureReasons?.map((reason: string, index: number) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recommendations:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {analytics.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Order #{order.orderId.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} items • ₹{order.totalAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    order.status === 'delivered' ? 'default' :
                    order.status === 'cancelled' ? 'destructive' : 'secondary'
                  }>
                    {order.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hotel Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Hotel Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Basic Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {hotel?.name}</p>
                <p><strong>Address:</strong> {hotel?.address}</p>
                <p><strong>Phone:</strong> {hotel?.phone}</p>
                <p><strong>Email:</strong> {hotel?.email}</p>
                <p><strong>Delivery Radius:</strong> {hotel?.deliveryRadius}km</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Subscription</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Plan:</strong> {hotel?.subscriptionPlan}</p>
                <p><strong>Status:</strong> 
                  <Badge className="ml-2" variant={hotel?.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                    {hotel?.subscriptionStatus}
                  </Badge>
                </p>
                <p><strong>End Date:</strong> {hotel?.subscriptionEndDate ? new Date(hotel.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Menu Items:</strong> {hotel?.menu?.length || 0}</p>
                <p><strong>Branches:</strong> {hotel?.branches?.length || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
