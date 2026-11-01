
import API from "./api";

// ==========================================
// AUTHENTICATION CONFIG
// ==========================================
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login to continue.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==========================================
// PLACE ORDER
// ==========================================
export const placeOrder = async (orderData) => {
  if (!orderData?.deliveryAddress || !orderData?.paymentMethod) {
    throw new Error("Delivery address and payment method are required.");
  }

  const response = await API.post(
    "/orders",
    {
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
    },
    getAuthConfig()
  );

  return response.data;
};

// ==========================================
// GET CUSTOMER ORDERS
// ==========================================
export const getOrders = async () => {
  const response = await API.get("/orders", getAuthConfig());

  return response.data.data;
};

// ==========================================
// GET ORDER BY ID
// ==========================================
export const getOrderById = async (id) => {
  const response = await API.get(
    `/orders/${id}`,
    getAuthConfig()
  );

  return response.data.data;
};

// ==========================================
// CANCEL ORDER
// ==========================================
export const cancelOrder = async (id) => {
  const response = await API.patch(
    `/orders/${id}/cancel`,
    {},
    getAuthConfig()
  );

  return response.data;
};
