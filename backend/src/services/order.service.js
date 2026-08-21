import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";


export const placeOrder = async (userId, orderData) => {
  const { deliveryAddress, paymentMethod } = orderData;

  if (!deliveryAddress || !paymentMethod) {
    throw new ApiError(
      400,
      "Delivery address and payment method are required"
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let totalAmount = 0;

  const orderItemsData = cart.items.map((item) => {
    totalAmount += item.quantity * item.menuItem.price;

    return {
      quantity: item.quantity,
      price: item.menuItem.price,
      menuItemId: item.menuItem.id,
    };
  });

  const restaurantId = cart.items[0].menuItem.restaurantId;

  const order = await prisma.order.create({
    data: {
      userId,
      restaurantId,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: true,
    },
  });

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return order;
};

export const getMyOrders = async (userId) => {
  return await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getRestaurantOrders = async (ownerId) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    include: {
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
              price: true,
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

export const getOrderById = async (orderId, userId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      restaurant: true,
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

export const updateOrderStatus = async (orderId, status) => {
  const validStatus = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!validStatus.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Build update data
  const updateData = {
    status,
  };

  // If COD order is delivered, mark payment as paid
  if (
    order.paymentMethod === "COD" &&
    status === "DELIVERED"
  ) {
    updateData.paymentStatus = true;
  }

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: updateData,
  });
};

export const cancelOrder = async (orderId, userId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    order.status !== "PENDING" &&
    order.status !== "CONFIRMED"
  ) {
    throw new ApiError(
      400,
      "Order cannot be cancelled"
    );
  }

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CANCELLED",
    },
  });
};