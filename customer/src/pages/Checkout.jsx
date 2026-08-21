import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../services/order.service";
import { createPaymentOrder, verifyPayment } from "../services/payment.service";

function Checkout() {
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address.");
      return;
    }

    try {
      const response = await placeOrder({ deliveryAddress, paymentMethod });
      const order = response.data;

      if (paymentMethod === "COD") {
        alert("Order placed successfully.");
        navigate("/orders");
        return;
      }

      const razorpayOrder = await createPaymentOrder(order.id);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "FoodHub",
        description: "Food Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (paymentResponse) {
          try {
            await verifyPayment(paymentResponse);
            alert("Payment Successful!");
            navigate("/orders");
          } catch (error) {
            alert("Payment verification failed.");
          }
        },
        theme: { color: "#ff5a5f" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Checkout</h1>

      <div style={{ backgroundColor: "#f9f9f9", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        {/* Address Field */}
        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Delivery Address</label>
          <textarea
            rows={4}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
            value={deliveryAddress}
            placeholder="Enter your full address..."
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>Select Payment Method</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {["COD", "ONLINE"].map((method) => (
              <label 
                key={method} 
                style={{ 
                  padding: "12px", 
                  border: `1px solid ${paymentMethod === method ? "#ff5a5f" : "#ddd"}`, 
                  borderRadius: "8px", 
                  cursor: "pointer",
                  backgroundColor: paymentMethod === method ? "#fff0f0" : "#fff",
                  transition: "0.3s"
                }}
              >
                <input
                  type="radio"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "10px" }}
                />
                {method === "COD" ? "Cash On Delivery" : "Pay Online (Razorpay)"}
              </label>
            ))}
          </div>
        </div>

        {/* Place Order Button */}
        <button 
          onClick={handlePlaceOrder}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#ff5a5f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#e04e53"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#ff5a5f"}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

export default Checkout;