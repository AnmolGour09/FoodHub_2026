import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getDashboard = async (ownerId) => {
  // Find restaurant of logged-in owner
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Get all orders of this restaurant
  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Today's starting time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // =========================
  // Dashboard Statistics
  // =========================

  // Orders placed today
  const todayOrders = orders.filter(
    (order) => new Date(order.createdAt) >= today
  ).length;

  // Pending Orders
  const pendingOrders = orders.filter((order) =>
    [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
    ].includes(order.status)
  ).length;

  // Completed Orders
  const completedOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  // =========================
  // Today's Revenue
  // =========================

  const todayRevenue = orders
    .filter((order) => {
      // Ignore previous days' orders
      if (new Date(order.createdAt) < today) {
        return false;
      }

      // COD Orders
      if (
        order.paymentMethod === "COD" &&
        order.status === "DELIVERED"
      ) {
        return true;
      }

      // Online Orders
      if (
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus === true &&
        ["READY", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
          order.status
        )
      ) {
        return true;
      }

      return false;
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    restaurant,
    todayOrders,
    pendingOrders,
    completedOrders,
    todayRevenue,
  };
};