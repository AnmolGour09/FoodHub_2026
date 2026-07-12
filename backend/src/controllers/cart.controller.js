import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  addToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
} from "../services/cart.service.js";

export const addItemToCart = asyncHandler(async (req, res) => {
  const { menuItemId, quantity } = req.body;

  const cartItem = await addToCart(
    req.user.id,
    menuItemId,
    quantity
  );

  res.status(201).json(
    new ApiResponse(
      201,
      "Item added to cart successfully",
      cartItem
    )
  );
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getMyCart(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Cart fetched successfully",
      cart
    )
  );
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const item = await updateCartItemQuantity(
    req.params.itemId,
    quantity
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Cart updated successfully",
      item
    )
  );
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  const result = await removeCartItem(req.params.itemId);

  res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      null
    )
  );
});