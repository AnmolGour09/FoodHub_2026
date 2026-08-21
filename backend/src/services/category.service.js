import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createCategory = async ({ name, ownerId }) => {
  if (!name || !ownerId) {
    throw new ApiError(400, "Name and ownerId are required");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      restaurantId: restaurant.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      restaurantId: restaurant.id,
    },
  });

  return category;
};

export const getRestaurantCategories = async (ownerId) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const categories = await prisma.category.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

export const getPublicCategories = async () => {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
    },
  });

  // Remove duplicates (case-insensitive)
  const uniqueCategories = [
    ...new Map(
      categories.map((item) => [
        item.name.trim().toLowerCase(),
        {
          name:
            item.name.trim().charAt(0).toUpperCase() +
            item.name.trim().slice(1).toLowerCase(),
        },
      ])
    ).values(),
  ];

  // Sort alphabetically
  uniqueCategories.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return uniqueCategories;
};

export const updateCategory = async ({
  categoryId,
  name,
  ownerId,
}) => {
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurantId: restaurant.id,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      restaurantId: restaurant.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: {
        id: categoryId,
      },
    },
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name: name.trim(),
    },
  });

  return updatedCategory;
};

export const deleteCategory = async ({
  categoryId,
  ownerId,
}) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      restaurantId: restaurant.id,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return null;
};