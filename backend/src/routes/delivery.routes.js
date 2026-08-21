import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import {
  loginDelivery,
  assignDelivery,
  getOrders,
  getOrder,
  acceptDeliveryOrder,
  deliverDeliveryOrder,
} from "../controllers/delivery.controller.js";


const router = express.Router();
router.post("/login", loginDelivery);
router.put(
  "/assign",
  protect,
  authorize("ADMIN"),
  assignDelivery
);

router.get(
  "/orders",
  protect,
  authorize("DELIVERY_PARTNER"),
  getOrders
);

router.get(
  "/orders/:id",
  protect,
  authorize("DELIVERY_PARTNER"),
  getOrder
);

router.patch(
  "/orders/:id/accept",
  protect,
  authorize("DELIVERY_PARTNER"),
  acceptDeliveryOrder
);

router.patch(
  "/orders/:id/delivered",
  protect,
  authorize("DELIVERY_PARTNER"),
  deliverDeliveryOrder
);

export default router;