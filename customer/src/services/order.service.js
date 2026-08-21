import API from "./api";

export const placeOrder = async (orderData) => {
  const token = localStorage.getItem("token");

  const response = await API.post("/orders", orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOrders = async () => {
  const token = localStorage.getItem("token");

  const response = await API.get("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const getOrderById = async (id) => {
  const token = localStorage.getItem("token");

  const response = await API.get(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const cancelOrder = async (id) => {
  const token = localStorage.getItem("token");

  const response = await API.patch(
    `/orders/${id}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};