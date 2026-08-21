import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import ApiError from "../utils/ApiError.js";

export const registerRestaurant = async ({
  ownerName,
  restaurantName,
  email,
  password,
  phone,
  address,
  city,
  state,
  pincode,
  openingTime,
  closingTime,
}) => {

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {

    const owner = await tx.user.create({
      data: {
        name: ownerName,
        email,
        password: hashedPassword,
        phone,
        role: "RESTAURANT_OWNER",
      },
    });

    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,

        phone,

        email,

        address,

        city,

        state,

        pincode,

        openingTime,

        closingTime,

        ownerId: owner.id,
      },
    });

    const token = generateToken(owner.id);

    return {
      token,
      owner,
      restaurant,
    };
  });

  return result;
};

export const loginRestaurant = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.role !== "RESTAURANT_OWNER") {
    throw new ApiError(
      403,
      "Only restaurant owners can login."
    );
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      ownerId: user.id,
    },
  });

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    restaurant,
  };
};