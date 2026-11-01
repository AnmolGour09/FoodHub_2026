
  import jwt from "jsonwebtoken";
  import prisma from "../config/prisma.js";
  import ApiError from "../utils/ApiError.js";
  import asyncHandler from "../utils/asyncHandler.js";

  export const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access denied. Please login again.");
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Session expired. Please login again.");
      }

      throw new ApiError(401, "Invalid authentication token.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new ApiError(401, "User not found. Please login again.");
    }

    req.user = user;
    next();
  });
