import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  addItemToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", protect, addItemToCart);
router.get("/", protect, getCart);
router.patch("/:itemId", protect, updateCartItem);
router.delete("/:itemId", protect, deleteCartItem);
export default router;