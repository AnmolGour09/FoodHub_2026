import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getOrders = async () => {
  const res = await API.get("/api/delivery/orders");
  return res.data.data;
};

export const getOrderById = async (id) => {
  const res = await API.get(`/api/delivery/orders/${id}`);
  return res.data.data;
};

export const acceptOrder = async (id) => {
  const res = await API.patch(`/api/delivery/orders/${id}/accept`);
  return res.data.data;
};

export const deliverOrder = async (id) => {
  const res = await API.patch(`/api/delivery/orders/${id}/deliver`);
  return res.data.data;
};