import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
}

export interface ICombo {
  id: string;
  name: string;
  items: string[];
  originalPrice: number;
  discountedPrice: number;
  isActive: boolean;
}

export interface IHotel extends Document {
  name: string;
  ownerId: string;
  tenantId: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  deliveryRadius: number;
  menu: IMenuItem[];
  combos: ICombo[];
  subscriptionPlan: 'monthly' | 'yearly';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  subscriptionEndDate: Date;
  isActive: boolean;
  branches: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    isActive: boolean;
  }>;
  staff: Array<{
    id: string;
    name: string;
    role: string;
    salary: number;
    joinDate: Date;
    isActive: boolean;
  }>;
  expenses: Array<{
    id: string;
    category: string;
    amount: number;
    description: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: String,
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 }
});

const ComboSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  items: [String],
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

const HotelSchema = new Schema<IHotel>({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  tenantId: { type: String, required: true },
  logo: String,
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  deliveryRadius: { type: Number, default: 5 },
  menu: [MenuItemSchema],
  combos: [ComboSchema],
  subscriptionPlan: { 
    type: String, 
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  subscriptionEndDate: Date,
  isActive: { type: Boolean, default: true },
  branches: [{
    id: String,
    name: String,
    address: String,
    phone: String,
    isActive: { type: Boolean, default: true }
  }],
  staff: [{
    id: String,
    name: String,
    role: String,
    salary: Number,
    joinDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  expenses: [{
    id: String,
    category: String,
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);
