import { registerUser, loginUser } from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", result));
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res
    .status(200)
    .json(new ApiResponse(200, "Login successful", result));
});

export const profile = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Profile fetched successfully", {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    })
  );
});