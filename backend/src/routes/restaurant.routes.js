import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  registerRestaurant,
  getRestaurants,
  getRestaurant,
  searchRestaurant,
} from "../controllers/restaurant.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  registerRestaurant
);
router.get("/search", searchRestaurant);
router.get("/", getRestaurants);
router.get("/:id", getRestaurant);
export default router;