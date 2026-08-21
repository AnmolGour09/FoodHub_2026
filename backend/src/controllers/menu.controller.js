import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createMenuItem,
  getRestaurantMenu,
  updateMenuItem,
  searchMenuItems,
  getMenuByCategory,
  deleteMenuItem,
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
  const menuItem = await createMenuItem({
  ...req.body,
  ownerId: req.user.id,
});

  res.status(201).json(
    new ApiResponse(
      201,
      "Menu item added successfully",
      menuItem
    )
  );
});

export const editMenuItem = asyncHandler(async (req, res) => {

  const menu = await updateMenuItem({
    menuItemId: req.params.id,
    ownerId: req.user.id,
    ...req.body,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Menu item updated successfully",
      menu
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

export const getRestaurantMenuItems = asyncHandler(async (req, res) => {

  const menu = await getRestaurantMenu(req.user.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Menu fetched successfully",
      menu
    )
  );
});

export const removeMenuItem = asyncHandler(async (req, res) => {

  await deleteMenuItem({
    menuItemId: req.params.id,
    ownerId: req.user.id,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Menu item deleted successfully"
    )
  );
});