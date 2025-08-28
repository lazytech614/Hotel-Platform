import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  orderId: string;
  customerId: string;
  hotelId: string;
  tenantId: string;
  items: IOrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'online' | 'cod';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  commission: number;
  hotelEarnings: number;
  platformEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  specialInstructions: String
});

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  hotelId: { type: String, required: true },
  tenantId: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  customerPhone: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cod'],
    required: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  estimatedDeliveryTime: { type: Date, required: true },
  actualDeliveryTime: Date,
  commission: { type: Number, default: 0 },
  hotelEarnings: { type: Number, default: 0 },
  platformEarnings: { type: Number, default: 0 },
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
