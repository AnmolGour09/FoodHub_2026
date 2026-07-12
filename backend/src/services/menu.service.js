import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

// Create Menu Item
export const createMenuItem = async (data) => {
  const {
    name,
    description,
    price,
    image,
    isVeg,
    categoryId,
    restaurantId,
  } = data;

  if (!name || !price || !categoryId || !restaurantId) {
    throw new ApiError(400, "Missing required fields");
  }

  // Check Restaurant
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  // Check Category
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price: Number(price),
      image,
      isVeg,
      categoryId,
      restaurantId,
    },
  });

  return menuItem;
};

// Search Menu Items
export const searchMenuItems = async (query) => {
  return await prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getMenuByCategory = async (categoryId) => {
  return await prisma.menuItem.findMany({
    where: {
      categoryId,
      isAvailable: true,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const filterMenu = async ({ veg, minPrice, maxPrice }) => {
  const where = {
    isAvailable: true,
  };

  // Veg / Non-Veg
  if (veg !== undefined) {
    where.isVeg = veg === "true";
  }

  // Price Filter
  if (minPrice || maxPrice) {
    where.price = {};

    if (minPrice) {
      where.price.gte = Number(minPrice);
    }

    if (maxPrice) {
      where.price.lte = Number(maxPrice);
    }
  }

  return await prisma.menuItem.findMany({
    where,
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  });
};