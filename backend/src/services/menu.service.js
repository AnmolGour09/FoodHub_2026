import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

// Create Menu Item
export const createMenuItem = async ({
  name,
  description,
  price,
  image,
  isVeg,
  isAvailable,
  categoryId,
  ownerId,
}) => {

  if (!name || !price || !categoryId) {
    throw new ApiError(400, "Name, price and category are required");
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

  const existingItem = await prisma.menuItem.findFirst({
    where: {
      restaurantId: restaurant.id,
      name,
    },
  });

  if (existingItem) {
    throw new ApiError(409, "Menu item already exists");
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price: Number(price),
      image,
      isVeg,
      isAvailable,
      categoryId,
      restaurantId: restaurant.id,
    },
  });

  return menuItem;
};

export const getRestaurantMenu = async (ownerId) => {

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const menu = await prisma.menuItem.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return menu;
};

export const updateMenuItem = async ({
  menuItemId,
  ownerId,
  name,
  description,
  price,
  image,
  isVeg,
  isAvailable,
  categoryId,
}) => {

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const menuItem = await prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      restaurantId: restaurant.id,
    },
  });

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: restaurant.id,
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  }

  if (name) {
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        restaurantId: restaurant.id,
        name,
        NOT: {
          id: menuItemId,
        },
      },
    });

    if (existingItem) {
      throw new ApiError(409, "Menu item already exists");
    }
  }

  const updatedMenu = await prisma.menuItem.update({
    where: {
      id: menuItemId,
    },
    data: {
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      image,
      isVeg,
      isAvailable,
      categoryId,
    },
  });

  return updatedMenu;
};

export const deleteMenuItem = async ({ menuItemId, ownerId }) => {

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId,
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const menuItem = await prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      restaurantId: restaurant.id,
    },
  });

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  await prisma.menuItem.delete({
    where: {
      id: menuItemId,
    },
  });

  return null;
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