import API from "../api/axios";

// Get Restaurant Orders
export const getRestaurantOrders = async () => {
  const res = await API.get("/orders/restaurant");
  return res.data.data;
};

// Update Order Status
export const updateOrderStatus = async (orderId, status) => {
  const res = await API.patch(
    `/orders/${orderId}/status`,
    { status }
  );

  return res.data.data;
};