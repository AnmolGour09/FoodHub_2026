import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
  registerRestaurant,
  getRestaurants,
  getRestaurant,
  searchRestaurant,
} from "../controllers/restaurant.controller.js";

import {
  getRestaurantOrdersList,
  changeOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// Register Restaurant
router.post(
  "/",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  registerRestaurant
);



// Restaurant Orders
router.get(
  "/orders",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  getRestaurantOrdersList
);


router.patch(
  "/orders/:id/status",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  changeOrderStatus
);

// Public Routes
router.get("/search", searchRestaurant);
router.get("/", getRestaurants);
router.get("/:id", getRestaurant);

export default router;