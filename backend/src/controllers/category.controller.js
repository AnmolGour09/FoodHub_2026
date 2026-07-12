import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createCategory } from "../services/category.service.js";

export const addCategory = asyncHandler(async (req, res) => {

  const category = await createCategory(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Category created successfully",
      category
    )
  );
});