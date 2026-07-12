import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createReview,
  getRestaurantReviews,
} from "../services/review.service.js";
export const addReview = asyncHandler(async (req, res) => {
  const review = await createReview(req.user.id, req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Review added successfully",
      review
    )
  );
});

export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await getRestaurantReviews(req.params.restaurantId);

  res.status(200).json(
    new ApiResponse(
      200,
      "Reviews fetched successfully",
      reviews
    )
  );
});