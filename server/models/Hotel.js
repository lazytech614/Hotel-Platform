import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: String,
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 },
});

const ComboSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  items: [String],
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
});

const HotelSchema = new mongoose.Schema(
  {
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
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "active",
    },
    subscriptionEndDate: Date,
    isActive: { type: Boolean, default: true },
    branches: [
      {
        id: String,
        name: String,
        address: String,
        phone: String,
        isActive: { type: Boolean, default: true },
      },
    ],
    staff: [
      {
        id: String,
        name: String,
        role: String,
        salary: Number,
        joinDate: Date,
        isActive: { type: Boolean, default: true },
      },
    ],
    expenses: [
      {
        id: String,
        category: String,
        amount: Number,
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Hotel", HotelSchema);
