import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const createRestaurant = async (restaurantData, ownerId) => {
  const {
    name,
    description,
    phone,
    email,
    address,
    city,
    state,
    pincode,
    openingTime,
    closingTime,
  } = restaurantData;

  if (
    !name ||
    !phone ||
    !address ||
    !city ||
    !state ||
    !pincode ||
    !openingTime ||
    !closingTime
  ) {
    throw new ApiError(400, "Please fill all required fields");
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      description,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      openingTime,
      closingTime,
      ownerId,
    },
  });

  return restaurant;
};

export const getAllRestaurants = async ({
  page = 1,
  limit = 10,
  sort = "rating",
  category,
}) => {
  const skip = (page - 1) * limit;

  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" }
      : { rating: "desc" };

  const where = {
    isVerified: true,
    isOpen: true,
  };

  // Safe category filter (handles undefined, empty string, and whitespace)
  if (category && category.trim() !== "") {
    where.categories = {
      some: {
        name: {
          equals: category.trim(),
          mode: "insensitive",
        },
      },
    };
  }

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy,
    skip,
    take: Number(limit),
  });

  const total = await prisma.restaurant.count({
    where,
  });

  return {
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    restaurants,
  };
};

export const searchRestaurants = async ({
  query = "",
  category = "",
}) => {
  const andFilters = [];

  if (query && query.trim() !== "") {
    andFilters.push({
      OR: [
        {
          name: {
            contains: query.trim(),
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: query.trim(),
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (category && category.trim() !== "") {
    andFilters.push({
      categories: {
        some: {
          name: {
            equals: category.trim(),
            mode: "insensitive",
          },
        },
      },
    });
  }

  return await prisma.restaurant.findMany({
    where: {
      isOpen: true,
      isVerified: true,
      ...(andFilters.length > 0 && { AND: andFilters }),
    },

    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },

      categories: {
        select: {
          name: true,
        },
      },
    },

    orderBy: {
      rating: "desc",
    },
  });
};

export const getRestaurantById = async (restaurantId) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: {
        orderBy: {
          name: "asc",
        },
      },
      menuItems: {
        where: {
          isAvailable: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return restaurant;
};