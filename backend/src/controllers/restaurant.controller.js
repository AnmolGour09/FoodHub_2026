import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  searchRestaurants,
} from "../services/restaurant.service.js";

// Register Restaurant
export const registerRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await createRestaurant(req.body, req.user.id);

  res.status(201).json(
    new ApiResponse(
      201,
      "Restaurant registered successfully",
      restaurant
    )
  );
});

// Get All Restaurants
export const getRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "rating" } = req.query;

  const restaurants = await getAllRestaurants({
    page: Number(page),
    limit: Number(limit),
    sort,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurants fetched successfully",
      restaurants
    )
  );
});

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await getRestaurantById(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurant fetched successfully",
      restaurant
    )
  );
});

export const searchRestaurant = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const restaurants = await searchRestaurants(q);

  res.status(200).json(
    new ApiResponse(
      200,
      "Search completed",
      restaurants
    )
  );
});