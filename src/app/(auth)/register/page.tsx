'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Building2,
  Users,
  Shield,
  CreditCard
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.role) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.user, data.token);

      // Redirect based on role
      switch (data.user.role) {
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
          router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Customer':
        return <User className="w-4 h-4" />;
      case 'Owner':
        return <Building2 className="w-4 h-4" />;
      case 'SalesAgent':
        return <CreditCard className="w-4 h-4" />;
      case 'Admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Your Account
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Join our hotel platform and start your journey
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role">Select Role</Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Customer</div>
                        <div className="text-xs text-gray-500">Order food from hotels</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Owner">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Hotel Owner</div>
                        <div className="text-xs text-gray-500">Manage your hotel business</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="SalesAgent">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Sales Agent</div>
                        <div className="text-xs text-gray-500">Handle subscriptions & sales</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Field */}
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Address Field */}
            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Role Benefits */}
            {formData.role && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
                  {getRoleIcon(formData.role)}
                  {formData.role} Benefits
                </div>
                <ul className="text-xs text-blue-700 space-y-1">
                  {formData.role === 'Customer' && (
                    <>
                      <li>• Browse and order from multiple hotels</li>
                      <li>• Real-time order tracking</li>
                      <li>• Multiple payment options</li>
                    </>
                  )}
                  {formData.role === 'Owner' && (
                    <>
                      <li>• Multi-tenant hotel management</li>
                      <li>• Analytics and failure-risk detection</li>
                      <li>• Staff and expense management</li>
                    </>
                  )}
                  {formData.role === 'SalesAgent' && (
                    <>
                      <li>• Subscription plan management</li>
                      <li>• Commission tracking</li>
                      <li>• Sales analytics dashboard</li>
                    </>
                  )}
                </ul>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-xs text-center text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
