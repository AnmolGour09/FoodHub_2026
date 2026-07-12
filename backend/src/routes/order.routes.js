import express from "express";
import { authorize } from "../middleware/role.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getOrders,
  getOrder,
  changeOrderStatus,
  cancelMyOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getOrders);

router.get("/:id", protect, getOrder);

router.patch(
  "/:id/status",
  protect,
  authorize("RESTAURANT_OWNER", "ADMIN"),
  changeOrderStatus
);

router.patch(
  "/:id/cancel",
  protect,
  cancelMyOrder
);
export default router;