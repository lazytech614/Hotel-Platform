'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  TrendingDown,
  Receipt
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  hotel: any;
  onUpdate: () => void;
  token: string | null;
}

export default function ExpenseManagement({ hotel, onUpdate, token }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: ''
  });

  const expenseCategories = [
    'Ingredients',
    'Utilities',
    'Rent',
    'Staff Salary',
    'Marketing',
    'Equipment',
    'Maintenance',
    'Insurance',
    'Other'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthExpenses = hotel?.expenses?.filter((expense: any) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === selectedMonth;
  }) || [];

  const totalExpenses = currentMonthExpenses.reduce((sum: number, expense: any) => 
    sum + expense.amount, 0
  );

  const expensesByCategory = expenseCategories.map(category => {
    const categoryExpenses = currentMonthExpenses.filter((expense: any) => 
      expense.category === category
    );
    const total = categoryExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    return { category, total, count: categoryExpenses.length };
  }).filter(item => item.total > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense = {
      id: editingExpense?.id || uuidv4(),
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: new Date(formData.date)
    };

    try {
      let updatedExpenses;
      if (editingExpense) {
        updatedExpenses = hotel.expenses.map((exp: any) => 
          exp.id === editingExpense.id ? expense : exp
        );
      } else {
        updatedExpenses = [...(hotel.expenses || []), expense];
      }

      const response = await fetch(`/api/hotels/${hotel._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses: updatedExpenses }),
      });

      if (response.ok) {
        onUpdate();
        resetForm();
        setIsAddDialogOpen(false);
        setEditingExpense(null);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const updatedExpenses = hotel.expenses.filter((expense: any) => expense.id !== expenseId);
      
      const response = await fetch(`/api/hotels/${hotel._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expenses: updatedExpenses }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      description: '',
      date: ''
    });
  };

  const openEditDialog = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {months[selectedMonth]} Expenses
                </p>
                <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{currentMonthExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Expense Management</p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingExpense ? 'Update' : 'Add Expense'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingExpense(null);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Records</CardTitle>
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(value) => setSelectedMonth(Number(value))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensesByCategory.map(({ category, total, count }) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">{count} transaction{count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {((total / totalExpenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>{months[selectedMonth]} Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthExpenses.length > 0 ? (
            <div className="space-y-4">
              {currentMonthExpenses.map((expense: any) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{expense.category}</h4>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{expense.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(expense)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses recorded</h3>
              <p className="text-muted-foreground mb-4">
                Add your first expense for {months[selectedMonth]} to get started
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
