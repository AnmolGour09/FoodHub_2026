import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../services/cart.service";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      setCart(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (item, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await removeCartItem(item.id);
      } else {
        await updateCartItem(item.id, newQuantity);
      }
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading your cart...</div>;
  if (!cart) return <div style={{ textAlign: "center", marginTop: "50px" }}>Error loading cart.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "30px" }}>My Cart</h1>

      {cart.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", border: "2px dashed #ddd", borderRadius: "12px" }}>
          <h3>Your cart is empty.</h3>
          <button onClick={() => navigate("/")} style={{ marginTop: "10px", padding: "10px 20px" }}>Go to Restaurants</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {cart.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                border: "1px solid #eee",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{item.menuItem.name}</h3>
                <p style={{ margin: 0, fontWeight: "bold", color: "#e67e22" }}>₹ {item.menuItem.price}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "6px" }}>
                  <button onClick={() => updateQuantity(item, item.quantity - 1)} style={btnStyle}>-</button>
                  <span style={{ padding: "0 15px", fontWeight: "bold" }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item, item.quantity + 1)} style={btnStyle}>+</button>
                </div>
                
                <button 
                  onClick={() => removeCartItem(item.id).then(fetchCart)}
                  style={{ ...btnStyle, backgroundColor: "#ff4d4d", color: "white", border: "none" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Cart Summary Section */}
          <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Total Items:</span>
              <span>{cart.totalItems}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "20px" }}>
              <span>Total Amount:</span>
              <span>₹ {cart.totalAmount}</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Proceed To Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple helper for button styles
const btnStyle = {
  padding: "8px 12px",
  cursor: "pointer",
  backgroundColor: "transparent",
  border: "none",
  fontSize: "1rem"
};

export default Cart;