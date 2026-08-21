import API from "./api";

export const createPaymentOrder = async (orderId) => {
  const token = localStorage.getItem("token");

  const response = await API.post(
    "/payment/create-order",
    { orderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};

export const verifyPayment = async (paymentData) => {
  const token = localStorage.getItem("token");

  const response = await API.post(
    "/payment/verify",
    paymentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};