import express from "express";
import { addCategory } from "../controllers/category.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  addCategory
);

export default router;