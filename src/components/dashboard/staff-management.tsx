'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  DollarSign,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  hotel: any;
  onUpdate: () => void;
  token: string | null;
}

export default function StaffManagement({ hotel, onUpdate, token }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    salary: '',
    joinDate: '',
    isActive: true
  });

  const roleOptions = [
    'Head Chef',
    'Sous Chef', 
    'Cook',
    'Delivery Executive',
    'Waiter',
    'Manager',
    'Cashier',
    'Cleaner'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffMember = {
      id: editingStaff?.id || uuidv4(),
      name: formData.name,
      role: formData.role,
      salary: Number(formData.salary),
      joinDate: new Date(formData.joinDate),
      isActive: formData.isActive
    };

    try {
      let updatedStaff;
      if (editingStaff) {
        updatedStaff = hotel.staff.map((staff: any) => 
          staff.id === editingStaff.id ? staffMember : staff
        );
      } else {
        updatedStaff = [...(hotel.staff || []), staffMember];
      }

      const response = await fetch(`/api/hotels/${hotel._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff: updatedStaff }),
      });

      if (response.ok) {
        onUpdate();
        resetForm();
        setIsAddDialogOpen(false);
        setEditingStaff(null);
      }
    } catch (error) {
      console.error('Error saving staff member:', error);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const updatedStaff = hotel.staff.filter((staff: any) => staff.id !== staffId);
      
      const response = await fetch(`/api/hotels/${hotel._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff: updatedStaff }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting staff member:', error);
    }
  };

  const toggleActiveStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const updatedStaff = hotel.staff.map((staff: any) =>
        staff.id === staffId ? { ...staff, isActive: !currentStatus } : staff
      );

      const response = await fetch(`/api/hotels/${hotel._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff: updatedStaff }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating staff status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      salary: '',
      joinDate: '',
      isActive: true
    });
  };

  const openEditDialog = (staff: any) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      salary: staff.salary.toString(),
      joinDate: new Date(staff.joinDate).toISOString().split('T')[0],
      isActive: staff.isActive
    });
    setIsAddDialogOpen(true);
  };

  const totalSalaryExpense = hotel?.staff?.reduce((sum: number, staff: any) => 
    staff.isActive ? sum + staff.salary : sum, 0
  ) || 0;

  const activeStaffCount = hotel?.staff?.filter((staff: any) => staff.isActive).length || 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold">{activeStaffCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Salary</p>
                <p className="text-2xl font-bold">₹{totalSalaryExpense.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Staff Management</p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="salary">Monthly Salary (₹)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="joinDate">Join Date</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <Label htmlFor="isActive">Active Employee</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingStaff ? 'Update' : 'Add Staff'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingStaff(null);
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

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {hotel?.staff?.length > 0 ? (
            <div className="space-y-4">
              {hotel.staff.map((staff: any) => (
                <div key={staff.id} className={`flex items-center justify-between p-4 border rounded-lg ${!staff.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${staff.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {staff.isActive ? (
                        <UserCheck className="w-5 h-5 text-green-600" />
                      ) : (
                        <UserX className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{staff.name}</h4>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(staff.joinDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ₹{staff.salary.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActiveStatus(staff.id, staff.isActive)}
                    >
                      {staff.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(staff)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(staff.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No staff members</h3>
              <p className="text-muted-foreground mb-4">Add your first team member to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
