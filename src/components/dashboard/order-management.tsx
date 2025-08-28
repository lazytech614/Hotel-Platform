'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  ChefHat,
  Phone,
  MapPin,
  RefreshCw,
  Eye
} from 'lucide-react';

interface Props {
  orders: any[];
  onUpdate: () => void;
  token: string | null;
}

export default function OrderManagement({ orders, onUpdate, token }: Props) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4 text-orange-500" />;
      case 'ready':
        return <Clock className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <Truck className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    onUpdate();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const getStatusButtonText = (status: string) => {
    switch (status) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Mark Delivered';
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-muted-foreground">Track and manage incoming orders</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order._id} className={`${
            order.status === 'pending' ? 'ring-2 ring-orange-200' : 
            order.status === 'preparing' ? 'ring-2 ring-blue-200' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderId.slice(-6)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    order.status === 'delivered' ? 'default' :
                    order.status === 'cancelled' ? 'destructive' :
                    order.status === 'preparing' ? 'secondary' : 'outline'
                  }>
                    {order.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {order.paymentMethod === 'online' ? 'Paid Online' : 'COD'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-muted-foreground italic">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price} x {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info & Actions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                  {order.estimatedDeliveryTime && (
                    <div>
                      <h4 className="font-semibold mb-2">Delivery Time</h4>
                      <p className="text-sm">
                        Expected: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="space-y-2">
                    {getNextStatus(order.status) && (
                      <Button
                        className="w-full"
                        onClick={() => updateOrderStatus(order._id, getNextStatus(order.status)!)}
                      >
                        {getStatusButtonText(order.status)}
                      </Button>
                    )}
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                      >
                        Cancel Order
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {filterStatus !== 'all' 
                ? `No ${filterStatus} orders at the moment` 
                : 'No orders received yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
