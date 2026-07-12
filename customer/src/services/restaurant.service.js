import API from "./api";


export const getRestaurants = async () => {
  const response = await API.get("/restaurants"); 
  return response.data;
};

export const getRestaurantById = async (id) => {
  const response = await API.get(`/restaurants/${id}`); 
  return response.data;
};