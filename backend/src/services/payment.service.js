import prisma from "../config/prisma.js";
import razorpay from "../config/razorpay.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";


export const createRazorpayOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const options = {
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order.id,
  };

  const razorpayOrder = await razorpay.orders.create(options);


  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentOrderId: razorpayOrder.id,
    },
  });


  return razorpayOrder;
};



// Verify Razorpay Payment

export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {


  const body =
    razorpay_order_id +
    "|" +
    razorpay_payment_id;


  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");


  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(
      400,
      "Payment verification failed"
    );
  }


  const order = await prisma.order.findFirst({
    where:{
      paymentOrderId: razorpay_order_id
    }
  });


  if(!order){
    throw new ApiError(
      404,
      "Order not found"
    );
  }


  const updatedOrder = await prisma.order.update({

    where:{
      id: order.id
    },

    data:{
      paymentId: razorpay_payment_id,
      paymentStatus:true,
      status:"CONFIRMED"
    }

  });


  return updatedOrder;

};