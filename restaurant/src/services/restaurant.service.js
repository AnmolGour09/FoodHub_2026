import API from "../api/axios";

export const getRestaurant = async () => {
  const response = await API.get("/restaurant/profile");
  return response.data;
};

export const updateRestaurant = async (data) => {
  const response = await API.put("/restaurant/profile", data);
  return response.data;
};