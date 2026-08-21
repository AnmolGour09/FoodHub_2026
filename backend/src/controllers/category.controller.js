import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createCategory,
  getRestaurantCategories,
  updateCategory,
  deleteCategory,
  getPublicCategories,
} from "../services/category.service.js";

export const removeCategory = asyncHandler(async (req, res) => {
  console.log("DELETE CATEGORY CONTROLLER HIT");

  await deleteCategory({
    categoryId: req.params.id,
    ownerId: req.user.id,
  });

  res.status(200).json(
    new ApiResponse(200, "Category deleted successfully")
  );
});

export const addCategory = asyncHandler(async (req, res) => {

  const category = await createCategory({
    name: req.body.name,
    ownerId: req.user.id,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      "Category created successfully",
      category
    )
  );
});
export const publicCategories = asyncHandler(async (req, res) => {
  const categories = await getPublicCategories();

  res.status(200).json(
    new ApiResponse(
      200,
      "Categories fetched successfully",
      categories
    )
  );
});
export const getCategories = asyncHandler(async (req, res) => {
  console.log("GET CATEGORY CONTROLLER");
  console.log("User:", req.user);

  const categories = await getRestaurantCategories(req.user.id);

  console.log("Categories:", categories);

  res.status(200).json(
    new ApiResponse(
      200,
      "Categories fetched successfully",
      categories
    )
  );
});

export const editCategory = asyncHandler(async (req, res) => {

  const category = await updateCategory({
    categoryId: req.params.id,
    name: req.body.name,
    ownerId: req.user.id,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Category updated successfully",
      category
    )
  );
});
