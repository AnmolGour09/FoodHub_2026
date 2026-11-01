
import API from "../api/axios";

export const getDashboard = async (range = 7) => {
  try {
    const response = await API.get("/dashboard", {
      params: {
        range,
      },
    });

    const result = response?.data?.data;

    if (!result || typeof result !== "object") {
      throw new Error("Invalid dashboard response from server");
    }

    return {
      restaurant: result.restaurant || null,

      todayOrders: Number(result.todayOrders ?? 0),
      pendingOrders: Number(result.pendingOrders ?? 0),
      completedOrders: Number(result.completedOrders ?? 0),
      todayRevenue: Number(result.todayRevenue ?? 0),

      // Backend analytics mapped correctly
      dailyOrders: Array.isArray(result.dailyOrders)
        ? result.dailyOrders.map((item) => ({
            date: String(item.date).slice(0, 10),
            orders: Number(item.orders ?? 0),
            revenue: Number(item.revenue ?? 0),
          }))
        : [],

      selectedRange: Number(result.selectedRange ?? range),
    };
  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
