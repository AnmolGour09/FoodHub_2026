import express from "express";

import { dashboard } from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("RESTAURANT_OWNER"),
  dashboard
);

export default router;