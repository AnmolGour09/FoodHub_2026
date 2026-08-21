import express from "express";
import {
  addMenuItem,
  getRestaurantMenuItems,
  searchMenu,
  menuByCategory,
  editMenuItem,
  removeMenuItem,
  getFilteredMenu,
} from "../controllers/menu.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  addMenuItem
);

router.get(
  "/restaurant",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  getRestaurantMenuItems
);

router.put(
  "/:id",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  editMenuItem
);

router.delete(
  "/:id",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  removeMenuItem
);

router.get("/search", searchMenu);

router.get("/filter", getFilteredMenu);

router.get("/category/:categoryId", menuByCategory);

export default router;