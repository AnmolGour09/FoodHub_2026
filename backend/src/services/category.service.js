import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createCategory = async ({ name, restaurantId }) => {

  if (!name || !restaurantId) {
    throw new ApiError(400, "Name and restaurantId are required");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const category = await prisma.category.create({
    data: {
      name,
      restaurantId,
    },
  });

  return category;
};