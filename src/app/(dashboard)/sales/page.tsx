'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  Building2, 
  TrendingUp,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Subscription {
  id: string;
  hotelName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  commission: number;
  nextPaymentDate?: string;
}

interface Commission {
  id: string;
  hotelName: string;
  amount: number;
  percentage: number;
  date: string;
  status: 'pending' | 'paid';
  transactionId?: string;
  subscriptionId: string;
}

export default function SalesPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    hotelName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    plan: 'monthly',
    amount: '1000'
  });

  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SalesAgent') {
      router.push('/login');
      return;
    }
    
    fetchData();
  }, [isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      // Mock data - replace with real API calls
      setSubscriptions([
        {
          id: '1',
          hotelName: 'Grand Palace Hotel',
          ownerName: 'John Doe',
          ownerEmail: 'john@grandpalace.com',
          ownerPhone: '+91 9876543210',
          plan: 'monthly',
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-12-15',
          amount: 1000,
          commission: 150,
          nextPaymentDate: '2024-02-15'
        },
        {
          id: '2',
          hotelName: 'Luxury Suites',
          ownerName: 'Jane Smith',
          ownerEmail: 'jane@luxurysuites.com',
          plan: 'yearly',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          amount: 12000,
          commission: 1800,
          nextPaymentDate: '2025-01-01'
        },
        {
          id: '3',
          hotelName: 'Budget Inn',
          ownerName: 'Mike Johnson',
          ownerEmail: 'mike@budgetinn.com',
          plan: 'monthly',
          status: 'pending',
          startDate: '2024-01-20',
          endDate: '2024-12-20',
          amount: 800,
          commission: 120
        }
      ]);

      setCommissions([
        {
          id: '1',
          hotelName: 'Grand Palace Hotel',
          amount: 150,
          percentage: 15,
          date: '2024-01-15',
          status: 'paid',
          transactionId: 'TXN001',
          subscriptionId: '1'
        },
        {
          id: '2',
          hotelName: 'Luxury Suites',
          amount: 1800,
          percentage: 15,
          date: '2024-01-01',
          status: 'paid',
          transactionId: 'TXN002',
          subscriptionId: '2'
        },
        {
          id: '3',
          hotelName: 'Budget Inn',
          amount: 120,
          percentage: 15,
          date: '2024-01-20',
          status: 'pending',
          subscriptionId: '3'
        }
      ]);

      setAnalytics({
        totalRevenue: 125000,
        activeSubscriptions: 45,
        pendingCommissions: 8,
        monthlyRecurring: 35000,
        conversionRate: 75,
        churnRate: 5
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setLoading(false);
    }
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      // Mock renewal - replace with real API
      console.log('Renewing subscription:', subscriptionId);
      alert('Renewal email sent successfully!');
    } catch (error) {
      console.error('Error renewing subscription:', error);
    }
  };

  const handleSendRenewalEmail = async (subscriptionId: string) => {
    try {
      // Mock email - replace with real API
      console.log('Sending renewal email for:', subscriptionId);
      alert('Renewal reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newSubscription: Subscription = {
        id: Date.now().toString(),
        ...subscriptionForm,
        status: 'pending',
        plan: subscriptionForm.plan as 'monthly' | 'yearly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: subscriptionForm.plan === 'yearly' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: Number(subscriptionForm.amount),
        commission: Number(subscriptionForm.amount) * 0.15
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      setSubscriptionForm({
        hotelName: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        plan: 'monthly',
        amount: '1000'
      });
      setIsAddSubscriptionOpen(false);
      alert('Subscription added successfully!');
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const calculateStats = () => {
    const totalRevenue = commissions.reduce((sum, comm) => sum + comm.amount, 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const monthlyRecurring = subscriptions
      .filter(s => s.status === 'active' && s.plan === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0);

    return {
      totalRevenue,
      pendingCommissions,
      activeSubscriptions,
      monthlyRecurring,
      totalSubscriptions: subscriptions.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading sales dashboard...</div>
      </div>
    );
  }

  const stats = calculateStats();

  // Mock chart data
  const revenueChartData = [
    { name: 'Jan', revenue: 12000, subscriptions: 15 },
    { name: 'Feb', revenue: 19000, subscriptions: 22 },
    { name: 'Mar', revenue: 15000, subscriptions: 18 },
    { name: 'Apr', revenue: 25000, subscriptions: 28 },
    { name: 'May', revenue: 22000, subscriptions: 25 },
    { name: 'Jun', revenue: 30000, subscriptions: 32 }
  ];

  const commissionData = [
    { name: 'This Week', amount: 5400 },
    { name: 'Last Week', amount: 4200 },
    { name: '2 Weeks Ago', amount: 3800 },
    { name: '3 Weeks Ago', amount: 4600 }
  ];

  const subscriptionTypes = [
    { name: 'Monthly', value: subscriptions.filter(s => s.plan === 'monthly').length, color: '#f97316' },
    { name: 'Yearly', value: subscriptions.filter(s => s.plan === 'yearly').length, color: '#06b6d4' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600">Manage subscriptions and track commissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isAddSubscriptionOpen} onOpenChange={setIsAddSubscriptionOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Subscription</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubscription} className="space-y-4">
                  <div>
                    <Label htmlFor="hotelName">Hotel Name</Label>
                    <Input
                      id="hotelName"
                      value={subscriptionForm.hotelName}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, hotelName: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={subscriptionForm.ownerName}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, ownerName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={subscriptionForm.ownerEmail}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ownerPhone">Owner Phone</Label>
                    <Input
                      id="ownerPhone"
                      type="tel"
                      value={subscriptionForm.ownerPhone}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select value={subscriptionForm.plan} onValueChange={(value: 'monthly' | 'yearly') => setSubscriptionForm(prev => ({ ...prev, plan: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly (₹1000)</SelectItem>
                        <SelectItem value="yearly">Yearly (₹12000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={subscriptionForm.amount}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Add Subscription</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddSubscriptionOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Commission earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalSubscriptions} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.monthlyRecurring.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                MRR from active plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCommissions}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="renewals">Renewals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search hotels or owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Subscriptions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Hotel</th>
                        <th className="text-left py-3 px-2">Owner</th>
                        <th className="text-left py-3 px-2">Plan</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">Commission</th>
                        <th className="text-left py-3 px-2">Next Payment</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-500">
                            No subscriptions found
                          </td>
                        </tr>
                      ) : (
                        filteredSubscriptions.map((sub) => (
                          <tr key={sub.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className="font-medium">{sub.hotelName}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div>{sub.ownerName}</div>
                              <div className="text-xs text-gray-500">{sub.ownerEmail}</div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant={sub.plan === 'yearly' ? 'default' : 'secondary'}>
                                {sub.plan}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <Badge 
                                variant={
                                  sub.status === 'active' ? 'default' : 
                                  sub.status === 'cancelled' ? 'destructive' : 'secondary'
                                }
                              >
                                {sub.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-medium">₹{sub.amount.toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-medium text-green-600">₹{sub.commission.toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-2">
                              {sub.nextPaymentDate && (
                                <div className="text-sm">
                                  {new Date(sub.nextPaymentDate).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {sub.status === 'active' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSendRenewalEmail(sub.id)}
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Hotel</th>
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">Percentage</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No commission data found
                          </td>
                        </tr>
                      ) : (
                        commissions.map((comm) => (
                          <tr key={comm.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">{comm.hotelName}</td>
                            <td className="py-3 px-2">
                              {new Date(comm.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 font-medium">
                              ₹{comm.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-2">{comm.percentage}%</td>
                            <td className="py-3 px-2">
                              <Badge variant={comm.status === 'paid' ? 'default' : 'secondary'}>
                                {comm.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-xs text-gray-500">
                              {comm.transactionId || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renewals" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptions
                      .filter(sub => {
                        const endDate = new Date(sub.endDate);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                      })
                      .map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{sub.hotelName}</h4>
                            <p className="text-sm text-gray-600">Expires: {new Date(sub.endDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendRenewalEmail(sub.id)}
                            >
                              Send Reminder
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleRenewSubscription(sub.id)}
                            >
                              Renew
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Recent Renewals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 py-8">
                      No recent renewals
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subscriptionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {subscriptionTypes.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></div>
                        <span className="text-sm">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">75%</div>
                      <div className="text-sm text-green-700">Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">5%</div>
                      <div className="text-sm text-red-700">Churn Rate</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹{(stats.totalRevenue / stats.totalSubscriptions).toFixed(0)}</div>
                    <div className="text-sm text-blue-700">Average Revenue per Subscription</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
