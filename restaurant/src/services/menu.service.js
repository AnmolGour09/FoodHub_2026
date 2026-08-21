import API from "../api/axios";

// Get all menu items
export const getMenuItems = async () => {
  const response = await API.get("/menu/restaurant");
  return response.data;
};

// Create Menu Item
export const createMenuItem = async (data) => {
  const response = await API.post("/menu", data);
  return response.data;
};

// Update Menu Item
export const updateMenuItem = async (id, data) => {
  const response = await API.put(`/menu/${id}`, data);
  return response.data;
};

// Delete Menu Item
export const deleteMenuItem = async (id) => {
  const response = await API.delete(`/menu/${id}`);
  return response.data;
};