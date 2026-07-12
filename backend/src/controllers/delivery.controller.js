import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { assignDeliveryPartner } from "../services/delivery.service.js";

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