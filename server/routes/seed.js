import express from "express";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/data", async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Order.deleteMany({});

    // Create sample users
    const admin = new User({
      name: "Admin User",
      email: "admin@platform.com",
      password: "password123",
      role: "Admin",
    });

    const owner1 = new User({
      name: "Hotel Owner 1",
      email: "owner1@hotel.com",
      password: "password123",
      role: "Owner",
      tenantId: uuidv4(),
    });

    const customer = new User({
      name: "John Customer",
      email: "customer@email.com",
      password: "password123",
      role: "Customer",
    });

    const salesAgent = new User({
      name: "Sales Agent",
      email: "sales@platform.com",
      password: "password123",
      role: "SalesAgent",
    });

    await Promise.all([
      admin.save(),
      owner1.save(),
      customer.save(),
      salesAgent.save(),
    ]);

    // Create sample hotel
    const hotel1 = new Hotel({
      name: "The Grand Restaurant",
      ownerId: owner1._id.toString(),
      tenantId: owner1.tenantId,
      address: "123 Main St, Mumbai",
      phone: "+91-9876543210",
      email: "contact@grandrestaurant.com",
      deliveryRadius: 10,
      menu: [
        {
          id: uuidv4(),
          name: "Butter Chicken",
          description: "Creamy tomato-based chicken curry",
          price: 320,
          category: "Main Course",
          isAvailable: true,
          preparationTime: 25,
        },
        {
          id: uuidv4(),
          name: "Paneer Tikka",
          description: "Grilled cottage cheese with spices",
          price: 280,
          category: "Appetizer",
          isAvailable: true,
          preparationTime: 15,
        },
      ],
      subscriptionPlan: "monthly",
      subscriptionStatus: "active",
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await hotel1.save();

    res.json({
      message: "Seed data created successfully",
      users: 4,
      hotels: 1,
      orders: 0,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res
      .status(500)
      .json({ error: "Failed to seed data", details: error.message });
  }
});

export default router;
