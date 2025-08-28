'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  Clock,
  Phone,
  User,
  ShoppingCart,
  ArrowLeft
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [addressType, setAddressType] = useState('home');

  const { user, token, isAuthenticated } = useAuthStore();
  const { cart, getCartTotal, clearCart, setCurrentOrder } = useOrderStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      router.push('/customer');
      return;
    }

    // Pre-fill user data
    setDeliveryAddress(user?.address || '');
    setPhone(user?.phone || '');

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated, cart.length, user, router]);

  const subtotal = getCartTotal();
  const deliveryFee = 30;
  const taxes = Math.round(subtotal * 0.18);
  const total = subtotal + deliveryFee + taxes;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter phone number');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: cart[0]?.hotelId,
          items: cart.map(item => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          })),
          totalAmount: total,
          deliveryAddress,
          customerPhone: phone,
          paymentMethod
        }),
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error);
      }

      setCurrentOrder(orderData.order);

      if (paymentMethod === 'online') {
        // Create Razorpay order
        const paymentResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR'
          }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(paymentData.error);
        }

        // Open Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: paymentData.order.amount,
          currency: paymentData.order.currency,
          name: 'Hotel Platform',
          description: `Order from ${cart[0]?.hotelName}`,
          order_id: paymentData.order.id,
          handler: async (response: any) => {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.order.orderId
              }),
            });

            if (verifyResponse.ok) {
              clearCart();
              router.push(`/order-tracking/${orderData.order.orderId}`);
            } else {
              alert('Payment verification failed');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: phone
          },
          theme: {
            color: '#f97316'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // Cash on delivery
        clearCart();
        router.push(`/order-tracking/${orderData.order.orderId}`);
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      alert(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-gray-600">Review your order and complete payment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details & Forms */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-medium text-sm text-gray-600">
                      From: {cart[0]?.hotelName}
                    </div>
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          {item.specialInstructions && (
                            <div className="text-xs text-gray-500 italic">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['home', 'work', 'other'].map((type) => (
                      <Button
                        key={type}
                        variant={addressType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAddressType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Complete Address</Label>
                    <Textarea
                      id="address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Flat no, Building name, Area, Landmark"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Pay Online</div>
                            <div className="text-sm text-gray-500">UPI, Cards, Net Banking</div>
                          </div>
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Cash on Delivery</div>
                            <div className="text-sm text-gray-500">Pay when order arrives</div>
                          </div>
                          <Truck className="w-5 h-5 text-gray-400" />
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Total & Place Order */}
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({cart.length} items)</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees</span>
                      <span>₹{taxes}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Estimated delivery: 30-45 minutes</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={loading || !deliveryAddress || !phone}
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
                  >
                    {loading ? 'Placing Order...' : `Place Order ₹${total}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By placing this order, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
