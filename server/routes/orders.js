import express from "express";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order.js";
import Hotel from "../models/Hotel.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get orders
router.get("/", authenticateToken, async (req, res) => {
  try {
    let orders;
    if (req.user.role === "Admin") {
      orders = await Order.find({});
    } else if (req.user.role === "Owner") {
      orders = await Order.find({ tenantId: req.user.tenantId });
    } else {
      orders = await Order.find({ customerId: req.user._id.toString() });
    }

    res.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { hotelId, items, deliveryAddress, customerPhone, paymentMethod } =
      req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const commission = totalAmount * 0.3;
    const hotelEarnings = totalAmount - commission;

    const order = new Order({
      orderId: uuidv4(),
      customerId: req.user._id.toString(),
      hotelId,
      tenantId: hotel.tenantId,
      items,
      totalAmount,
      deliveryAddress,
      customerPhone,
      paymentMethod,
      commission,
      hotelEarnings,
      platformEarnings: commission,
      estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
    });

    await order.save();
    res.status(201).json({ order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
