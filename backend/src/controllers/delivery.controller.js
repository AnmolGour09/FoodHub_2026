import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  assignDeliveryPartner,
  getAssignedOrders,
  getOrderDetails,
  acceptOrder,
  deliverOrder,
  loginDeliveryPartner,
} from "../services/delivery.service.js";

export const loginDelivery = asyncHandler(async (req, res) => {
  const data = await loginDeliveryPartner(req.body);

  res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      data
    )
  );
});

export const assignDelivery = asyncHandler(async (req, res) => {
  const { orderId, deliveryPartnerId } = req.body;

  const order = await assignDeliveryPartner(
    orderId,
    deliveryPartnerId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Delivery partner assigned successfully",
      order
    )
  );
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await getAssignedOrders(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Assigned orders fetched successfully",
      orders
    )
  );
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await getOrderDetails(
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
export const acceptDeliveryOrder = asyncHandler(async (req, res) => {
  const order = await acceptOrder(
    req.params.id,
    req.user.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order accepted successfully",
      order
    )
  );
});
export const deliverDeliveryOrder = asyncHandler(
  async (req, res) => {
    const order = await deliverOrder(
      req.params.id,
      req.user.id
    );

    res.status(200).json(
      new ApiResponse(
        200,
        "Order delivered successfully",
        order
      )
    );
  }
);