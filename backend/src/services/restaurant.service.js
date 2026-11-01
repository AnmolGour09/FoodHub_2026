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

export const uploadRestaurantLogo = async (image) => {
  const formData = new FormData();

  formData.append("image", image);

  const response = await API.post(
    "/restaurant/profile/logo",
    formData
  );

  return response;
};

const getCurrentIndiaMinutes = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hour = Number(
    parts.find((part) => part.type === "hour").value
  );
  const minute = Number(
    parts.find((part) => part.type === "minute").value
  );

  return hour * 60 + minute;
};

const parseTimeToMinutes = (time) => {
  if (!time) return null;

  const value = time.trim();
  const match = value.match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (
    hours > (period ? 12 : 23) ||
    minutes > 59 ||
    (period && hours < 1)
  ) {
    return null;
  }

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const isOpenBySchedule = (restaurant, currentMinutes) => {
  const opening = parseTimeToMinutes(restaurant.openingTime);
  const closing = parseTimeToMinutes(restaurant.closingTime);

  if (opening === null || closing === null) {
    return false;
  }

  // Same opening and closing time means closed all day.
  if (opening === closing) return false;

  // Normal schedule, e.g. 09:00–23:00.
  if (opening < closing) {
    return currentMinutes >= opening &&
      currentMinutes < closing;
  }

  // Overnight schedule, e.g. 18:00–02:00.
  return currentMinutes >= opening ||
    currentMinutes < closing;
};

export const getAllRestaurants = async ({
  page = 1,
  limit = 10,
  sort = "rating",
  category,
}) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(
    10,
    Math.max(1, Number(limit) || 10)
  );

  const where = {
    isVerified: true,
  };

  if (category?.trim()) {
    where.categories = {
      some: {
        name: {
          equals: category.trim(),
          mode: "insensitive",
        },
      },
    };
  }

  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" }
      : { rating: "desc" };

  // Fetch verified restaurants and apply the schedule filter
  // BEFORE pagination, so closed restaurants don't use up slots.
  const allRestaurants = await prisma.restaurant.findMany({
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
  });

  const currentMinutes = getCurrentIndiaMinutes();

  const openRestaurants = allRestaurants.filter((restaurant) =>
    isOpenBySchedule(restaurant, currentMinutes)
  );

  const total = openRestaurants.length;
  const skip = (currentPage - 1) * pageSize;

  const restaurants = openRestaurants
    .slice(skip, skip + pageSize)
    .map((restaurant) => ({
      ...restaurant,
      isOpen: true,
    }));

  return {
    total,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
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