
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

// ==========================================
// PLACE ORDER
// ==========================================
export const placeOrder = async (userId, orderData) => {
  const deliveryAddress = orderData?.deliveryAddress?.trim();
  const paymentMethod = orderData?.paymentMethod;

  // Validate delivery address
  if (!deliveryAddress || deliveryAddress.length < 5) {
    throw new ApiError(400, "Please provide a valid delivery address");
  }

  // Validate payment method
  if (!["COD", "ONLINE"].includes(paymentMethod)) {
    throw new ApiError(400, "Please select a valid payment method");
  }

  // Create order and clear cart atomically
  const order = await prisma.$transaction(async (tx) => {

    // Fetch user's cart
    const cart = await tx.cart.findUnique({
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
      throw new ApiError(400, "Your cart is empty");
    }

    // Validate menu items
    for (const item of cart.items) {
      if (!item.menuItem) {
        throw new ApiError(400, "One or more menu items are unavailable");
      }

      if (item.quantity <= 0 || !Number.isFinite(item.quantity)) {
        throw new ApiError(400, "Invalid item quantity");
      }

      if (
        !Number.isFinite(Number(item.menuItem.price)) ||
        Number(item.menuItem.price) < 0
      ) {
        throw new ApiError(400, "Invalid menu item price");
      }
    }

    // Current order model supports one restaurant per order.
    const restaurantId = cart.items[0].menuItem.restaurantId;

    const hasMultipleRestaurants = cart.items.some(
      (item) => item.menuItem.restaurantId !== restaurantId
    );

    if (hasMultipleRestaurants) {
      throw new ApiError(
        400,
        "Please order from one restaurant at a time"
      );
    }

    // Calculate total using paise to avoid floating-point errors.
    const totalPaise = cart.items.reduce((total, item) => {
      const pricePaise = Math.round(
        Number(item.menuItem.price) * 100
      );

      return total + pricePaise * item.quantity;
    }, 0);

    const totalAmount = totalPaise / 100;

    // Prepare order items
    const orderItemsData = cart.items.map((item) => ({
      quantity: item.quantity,
      price: item.menuItem.price,
      menuItemId: item.menuItem.id,
    }));

    // Create order
    const newOrder = await tx.order.create({
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

    // Clear cart only after successful order creation.
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return newOrder;
  });

  return order;
};

// ==========================================
// GET CUSTOMER ORDERS
// ==========================================
export const getMyOrders = async (userId) => {
  return prisma.order.findMany({
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

// ==========================================
// GET RESTAURANT ORDERS
// ==========================================
export const getRestaurantOrders = async (ownerId) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return prisma.order.findMany({
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
};

// ==========================================
// GET ORDER BY ID
// ==========================================
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

// ==========================================
// UPDATE ORDER STATUS
// ==========================================
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

  const updateData = {
    status,
  };

  // COD payment becomes paid after delivery.
  if (order.paymentMethod === "COD" && status === "DELIVERED") {
    updateData.paymentStatus = true;
  }

  return prisma.order.update({
    where: {
      id: orderId,
    },

    data: updateData,
  });
};

// ==========================================
// CANCEL CUSTOMER ORDER
// ==========================================
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

  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled");
  }

  return prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status: "CANCELLED",
    },
  });
};
