import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  registerRestaurant,
  loginRestaurant,
} from "../services/restaurantAuth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerRestaurant(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Restaurant registered successfully",
      result
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginRestaurant(req.body);

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurant login successful",
      result
    )
  );
});