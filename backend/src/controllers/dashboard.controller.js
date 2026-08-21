import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getDashboard } from "../services/dashboard.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  const result = await getDashboard(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Dashboard fetched successfully",
      result
    )
  );
});