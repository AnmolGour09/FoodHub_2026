import API from "../api/axios";

export const getRestaurants = async (category = "", options = {}) => {
  const url = category
    ? `/restaurants?category=${encodeURIComponent(category)}`
    : "/restaurants";

  const res = await API.get(url, {
    signal: options?.signal, // Axios request aborting enabled
  });

  return res.data.data;
};

export const searchRestaurants = async (
  query,
  category = "",
  options = {}
) => {
  const url = category
    ? `/restaurants/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
    : `/restaurants/search?q=${encodeURIComponent(query)}`;

  const res = await API.get(url, {
    signal: options?.signal, // Axios request aborting enabled
  });

  return res.data.data;
};

export const getRestaurantById = async (id, options = {}) => {
  const response = await API.get(`/restaurants/${id}`, {
    signal: options?.signal,
  });
  return response.data.data;
};