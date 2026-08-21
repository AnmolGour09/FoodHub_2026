import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const login = async (email, password) => {
  const response = await API.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
};