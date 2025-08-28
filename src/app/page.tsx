'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'Admin':
          router.push('/admin');
          break;
        case 'Owner':
          router.push('/owner');
          break;
        case 'SalesAgent':
          router.push('/sales');
          break;
        case 'Customer':
          router.push('/customer');
          break;
        default:
          router.push('/login');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hotel Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Multi-tenant hotel management with AI-powered analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>For Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Browse menus, place orders, track deliveries
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/customer')}
              >
                Order Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Hotel Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage your hotel, menu, orders, and staff
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/owner')}
              >
                Manage Hotel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Sales Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Handle subscriptions and commission tracking
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/sales')}
              >
                Sales Panel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Monitor platform, users, and analytics
              </p>
              <Button 
                className="w-full" 
                onClick={() => router.push('/admin')}
              >
                Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button 
              onClick={() => router.push('/register')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
