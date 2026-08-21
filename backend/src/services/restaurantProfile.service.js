import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getRestaurantProfile = async (ownerId) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return restaurant;
};

export const updateRestaurantProfile = async (ownerId, data) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: data.name,
      description: data.description,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      deliveryFee: Number(data.deliveryFee),
      minimumOrder: Number(data.minimumOrder),
      isOpen: data.isOpen,
    },
  });
};