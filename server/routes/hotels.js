import express from "express";
import Hotel from "../models/Hotel.js";
import { authenticateToken, requireRoles } from "../middleware/auth.js";

const router = express.Router();

// Get all hotels
router.get("/", authenticateToken, async (req, res) => {
  try {
    let hotels;
    if (req.user.role === "Admin") {
      hotels = await Hotel.find({});
    } else if (req.user.role === "Owner") {
      hotels = await Hotel.find({ tenantId: req.user.tenantId });
    } else {
      hotels = await Hotel.find({ isActive: true });
    }

    res.json({ hotels });
  } catch (error) {
    console.error("Get hotels error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create hotel
router.post(
  "/",
  authenticateToken,
  requireRoles(["Owner"]),
  async (req, res) => {
    try {
      const hotel = new Hotel({
        ...req.body,
        ownerId: req.user._id.toString(),
        tenantId: req.user.tenantId,
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await hotel.save();
      res.status(201).json({ hotel });
    } catch (error) {
      console.error("Create hotel error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
