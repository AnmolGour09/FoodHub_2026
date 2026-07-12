import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { assignDelivery } from "../controllers/delivery.controller.js";

const router = express.Router();

router.put(
  "/assign",
  protect,
  authorize("ADMIN"),
  assignDelivery
);

export default router;