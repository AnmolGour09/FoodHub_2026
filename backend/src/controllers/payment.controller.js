import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { 
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../services/payment.service.js";

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const payment = await createRazorpayOrder(orderId);

  res.status(200).json(
    new ApiResponse(
      200,
      "Payment order created successfully",
      payment
    )
  );
});

export const verifyPayment = asyncHandler(async (req,res)=>{

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;


  const order = await verifyRazorpayPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });


  res.status(200).json(
    new ApiResponse(
      200,
      "Payment verified successfully",
      order
    )
  );

});