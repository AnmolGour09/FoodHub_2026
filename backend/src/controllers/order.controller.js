import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../services/order.service.js";


export const createOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Order placed successfully",
      order
    )
  );
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await getMyOrders(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched successfully",
      orders
    )
  );
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await getOrderById(
    req.params.id,
    req.user.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order fetched successfully",
      order
    )
  );
});

export const changeOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await updateOrderStatus(
    req.params.id,
    status
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order status updated successfully",
      order
    )
  );
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await cancelOrder(
    req.params.id,
    req.user.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order cancelled successfully",
      order
    )
  );
});