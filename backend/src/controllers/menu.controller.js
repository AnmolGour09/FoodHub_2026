import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createMenuItem,
  searchMenuItems,
  getMenuByCategory,
  filterMenu,
} from "../services/menu.service.js";

export const searchMenu = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const menuItems = await searchMenuItems(q);

  res.status(200).json(
    new ApiResponse(
      200,
      "Menu search completed",
      menuItems
    )
  );
});

export const addMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await createMenuItem(req.body);

  res.status(201).json(
    new ApiResponse(
      201,
      "Menu item added successfully",
      menuItem
    )
  );
});

export const menuByCategory = asyncHandler(async (req, res) => {
  const menu = await getMenuByCategory(req.params.categoryId);

  res.status(200).json(
    new ApiResponse(
      200,
      "Category menu fetched successfully",
      menu
    )
  );
});

export const getFilteredMenu = asyncHandler(async (req, res) => {
  const { veg, minPrice, maxPrice } = req.query;

  const menu = await filterMenu({
    veg,
    minPrice,
    maxPrice,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Filtered menu fetched successfully",
      menu
    )
  );
});