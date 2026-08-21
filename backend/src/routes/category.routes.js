import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
  addCategory,
  getCategories,
  editCategory,
  removeCategory,
  publicCategories,
} from "../controllers/category.controller.js";


const router = express.Router();

router.post(
  "/",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  addCategory
);
router.get("/public", publicCategories);
router.get(
  "/restaurant",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  getCategories
);

router.put(
  "/:id",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  editCategory
);
router.delete(
  "/:id",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  removeCategory
);
export default router;