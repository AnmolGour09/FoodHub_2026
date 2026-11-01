import express from "express";

import { uploadLogo } from "../controllers/restaurantImage.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/logo",
  protect,
  authorize("RESTAURANT_OWNER"),
  upload.single("image"),
  uploadLogo
);

export default router;
