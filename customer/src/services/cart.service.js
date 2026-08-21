import API from "./api";

export const addToCart = async (menuItemId, quantity = 1) => {
  const token = localStorage.getItem("token");

  const response = await API.post(
    "/cart",
    { menuItemId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getCart = async () => {
  const token = localStorage.getItem("token");

  const response = await API.get("/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const token = localStorage.getItem("token");

  const response = await API.patch(
    `/cart/${itemId}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const removeCartItem = async (itemId) => {
  const token = localStorage.getItem("token");

  const response = await API.delete(`/cart/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};