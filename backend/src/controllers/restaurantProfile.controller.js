import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  getRestaurantProfile as getRestaurantProfileService,
  updateRestaurantProfile,
} from "../services/restaurantProfile.service.js";

export const getRestaurantProfile = asyncHandler(async (req, res) => {
  const restaurant = await getRestaurantProfileService(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurant fetched successfully",
      restaurant
    )
  );
});

export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await updateRestaurantProfile(
    req.user.id,
    req.body
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurant updated successfully",
      restaurant
    )
  );
});