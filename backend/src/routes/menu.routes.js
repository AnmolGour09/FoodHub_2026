import express from "express";
import {
  addMenuItem,
  searchMenu,
  menuByCategory,
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

router.post("/", protect, authorize("RESTAURANT_OWNER", "ADMIN"), addMenuItem);

router.get("/search", searchMenu);

router.get("/category/:categoryId", menuByCategory);

router.get("/filter", getFilteredMenu);

export default router;