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
}) => {
  const skip = (page - 1) * limit;

  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" }
      : { rating: "desc" };

  const restaurants = await prisma.restaurant.findMany({
    where: {
      isVerified: true,
      isOpen: true,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy,
    skip,
    take: Number(limit),
  });

  const total = await prisma.restaurant.count({
    where: {
      isVerified: true,
      isOpen: true,
    },
  });

  return {
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    restaurants,
  };
};

export const searchRestaurants = async (query) => {
  return await prisma.restaurant.findMany({
    where: {
      isOpen: true,
      isVerified: true,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
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