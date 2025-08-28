'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  ChefHat,
  MapPin,
  Phone,
  Star,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Order {
  orderId: string;
  items: any[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: string;
  customerPhone: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  createdAt: string;
  hotelName?: string;
}

export default function OrderTrackingPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const orderId = params.orderId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchOrder();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrder, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, orderId, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'preparing':
        return <ChefHat className="w-5 h-5 text-orange-500" />;
      case 'ready':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <Truck className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order placed, waiting for confirmation';
      case 'confirmed':
        return 'Order confirmed by restaurant';
      case 'preparing':
        return 'Your food is being prepared';
      case 'ready':
        return 'Order ready for pickup/delivery';
      case 'delivered':
        return 'Order delivered successfully';
      case 'cancelled':
        return 'Order cancelled';
      default:
        return 'Processing your order';
    }
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed', icon: CheckCircle },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Clock },
    { key: 'delivered', label: 'Delivered', icon: Truck }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Button onClick={() => router.push('/customer')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/customer')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Track Order</h1>
              <p className="text-gray-600">Order #{orderId.slice(-8)}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Order Status Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  {getStatusMessage(order.status)}
                </CardTitle>
                <Badge 
                  variant={order.status === 'delivered' ? 'default' : 'secondary'}
                >
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Tracker */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {orderSteps.map((step, index) => {
                  const isCompleted = orderSteps.findIndex(s => s.key === order.status) >= index;
                  const isCurrent = step.key === order.status;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="text-sm text-orange-600">In Progress</div>
                        )}
                      </div>
                      {index < orderSteps.length - 1 && (
                        <div className={`w-px h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Estimated Delivery */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Estimated Delivery</h3>
                  <p className="text-gray-600">
                    {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span>From: {order.hotelName || 'Restaurant'}</span>
                </div>
                
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      {item.specialInstructions && (
                        <div className="text-xs text-gray-500 italic">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Payment: {order.paymentStatus === 'paid' ? '✓ Paid' : 'Cash on Delivery'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.deliveryAddress}</p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {order.customerPhone}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {order.status === 'delivered' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold">Rate your experience</h3>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-8 h-8 text-gray-300 hover:text-yellow-400 cursor-pointer"
                        />
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      Submit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button 
              onClick={() => router.push('/customer')}
              className="w-full"
            >
              Order Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
