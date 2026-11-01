
import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "foodhub/restaurants",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result?.secure_url) {
          return reject(
            new Error("Cloudinary did not return an image URL")
          );
        }

        resolve(result);
      }
    );

    stream.on("error", reject);
    stream.end(buffer);
  });

export const uploadRestaurantLogo = async (ownerId, file) => {
  if (!file?.buffer) {
    throw new ApiError(400, "Please select an image");
  }

  if (!file.mimetype?.startsWith("image/")) {
    throw new ApiError(400, "Only image files are allowed");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId },
    select: { id: true, logo: true },
  });

  if (!restaurant) {
    throw new ApiError(
      404,
      "No restaurant found for this owner"
    );
  }

  try {
    const result = await uploadToCloudinary(file.buffer);

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { logo: result.secure_url },
    });

    return updatedRestaurant;
  }  catch (error) {
  console.error("========== RESTAURANT IMAGE UPLOAD ERROR ==========");
  console.error("Message:", error.message);
  console.error("Cloudinary HTTP code:", error.http_code);
  console.error("Cloudinary error:", error.error);
  console.error("Stack:", error.stack);
  console.error("===================================================");

  throw error;
}

};
