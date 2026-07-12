import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createReview = async (userId, reviewData) => {
  const { restaurantId, rating, comment } = reviewData;

  if (!restaurantId || !rating) {
    throw new ApiError(400, "Restaurant and rating are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Restaurant exists?
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // User has ordered from this restaurant?
  const order = await prisma.order.findFirst({
    where: {
      userId,
      restaurantId,
    },
  });

  if (!order) {
    throw new ApiError(
      403,
      "You can review only restaurants you've ordered from"
    );
  }

  // Already reviewed?
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this restaurant");
  }

  const review = await prisma.review.create({
    data: {
      userId,
      restaurantId,
      rating,
      comment,
    },
  });

  // Update restaurant average rating
  const reviews = await prisma.review.findMany({
    where: {
      restaurantId,
    },
  });

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },
    data: {
      rating: average,
    },
  });

  return review;
};

export const getRestaurantReviews = async (restaurantId) => {
  return await prisma.review.findMany({
    where: {
      restaurantId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};