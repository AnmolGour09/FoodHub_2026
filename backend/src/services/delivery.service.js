import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const assignDeliveryPartner = async (
  orderId,
  deliveryPartnerId
) => {
  // Check Order
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check Delivery Partner
  const partner = await prisma.user.findUnique({
    where: {
      id: deliveryPartnerId,
    },
  });

  if (!partner || partner.role !== "DELIVERY_PARTNER") {
    throw new ApiError(404, "Delivery partner not found");
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      deliveryPartnerId,
      status: "OUT_FOR_DELIVERY",
    },
  });

  return updatedOrder;
};