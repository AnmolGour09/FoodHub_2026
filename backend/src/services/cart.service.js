import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const addToCart = async (userId, menuItemId, quantity) => {
  quantity = Number(quantity) || 1;

  const menuItem = await prisma.menuItem.findUnique({
    where: {
      id: menuItemId,
    },
  });

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      menuItemId,
    },
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      menuItemId,
      quantity,
    },
  });
};
export const getMyCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              restaurant: {
                select: {
                  id: true,
                  name: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      items: [],
      totalAmount: 0,
      totalItems: 0,
    };
  }

  let totalAmount = 0;
  let totalItems = 0;

  cart.items.forEach((item) => {
    totalAmount += item.quantity * item.menuItem.price;
    totalItems += item.quantity;
  });

  return {
    items: cart.items,
    totalAmount,
    totalItems,
  };
};
export const updateCartItemQuantity = async (itemId, quantity) => {
  quantity = Number(quantity);

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  return await prisma.cartItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity,
    },
  });
};

export const removeCartItem = async (itemId) => {
  const item = await prisma.cartItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });

  return {
    message: "Item removed from cart",
  };
};