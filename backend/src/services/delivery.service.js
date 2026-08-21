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
      
    },
  });

  return updatedOrder;
};
export const getAssignedOrders = async (deliveryPartnerId) => {
  const orders = await prisma.order.findMany({
    where: {
      deliveryPartnerId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          city: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};
export const getOrderDetails = async (orderId, deliveryPartnerId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deliveryPartnerId,
    },
    include: {
      restaurant: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return order;
};
export const acceptOrder = async (orderId, deliveryPartnerId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deliveryPartnerId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "READY") {
    throw new ApiError(400, "Order cannot be accepted");
  }

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "OUT_FOR_DELIVERY",
    },
  });
};
export const deliverOrder = async (
  orderId,
  deliveryPartnerId
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deliveryPartnerId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "OUT_FOR_DELIVERY") {
    throw new ApiError(
      400,
      "Order is not out for delivery"
    );
  }

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "DELIVERED",
    },
  });
};
import { loginUser } from "./auth.service.js";

export const loginDeliveryPartner = async (data) => {
  const result = await loginUser(data);

  if (result.user.role !== "DELIVERY_PARTNER") {
    throw new ApiError(
      403,
      "Only delivery partners can login here"
    );
  }

  return result;
};