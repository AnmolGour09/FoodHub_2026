import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  uploadRestaurantLogo,
} from "../services/restaurantImage.service.js";

export const uploadLogo = asyncHandler(async (req, res) => {
  const restaurant = await uploadRestaurantLogo(
    req.user.id,
    req.file
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Restaurant image uploaded successfully",
      restaurant
    )
  );
});