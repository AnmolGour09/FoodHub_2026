import express from "express";

import {
  getRestaurantProfile,
  updateRestaurant,
} from "../controllers/restaurantProfile.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("RESTAURANT_OWNER"),
  getRestaurantProfile
);

router.put(
  "/",
  protect,
  authorize("RESTAURANT_OWNER"),
  updateRestaurant
);

export default router;