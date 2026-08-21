import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantById } from "../services/restaurant.service";
import { addToCart } from "../services/cart.service";

function Restaurant() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const restaurantData = await getRestaurantById(id);
        setRestaurant(restaurantData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Initial Load
    fetchRestaurant();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchRestaurant();
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const handleAddToCart = async (menuItemId) => {
    if (!restaurant?.isOpen) {
      alert("Restaurant is closed.");
      return;
    }

    try {
      await addToCart(menuItemId);
      alert("Item added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add item");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Restaurant Not Found
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Restaurant Header */}
      <header
        style={{
          marginBottom: "30px",
          borderBottom: "2px solid #eee",
          paddingBottom: "20px",
        }}
      >
        <h1 style={{ margin: "0 0 10px 0" }}>{restaurant.name}</h1>

        <p style={{ color: "#666", marginBottom: "5px" }}>
          {restaurant.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: "15px",
            fontWeight: "bold",
            alignItems: "center",
          }}
        >
          <span>⭐ {restaurant.rating}</span>

          <span>📍 {restaurant.city}</span>

          <span
            style={{
              color: restaurant.isOpen ? "#16a34a" : "#dc2626",
            }}
          >
            {restaurant.isOpen ? "🟢 Open" : "🔴 Closed"}
          </span>
        </div>
      </header>

      {/* Closed Banner */}
      {!restaurant.isOpen && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "25px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🚫 This restaurant is currently closed. Ordering is unavailable.
        </div>
      )}

      {/* Menu */}
      <h2 style={{ marginBottom: "20px" }}>Our Menu</h2>

      {!restaurant.menuItems || restaurant.menuItems.length === 0 ? (
        <p>No menu items available.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {restaurant.menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                opacity: restaurant.isOpen ? 1 : 0.6,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 5px 0" }}>{item.name}</h3>

                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "0.9rem",
                    color: "#555",
                  }}
                >
                  {item.description}
                </p>

                <p
                  style={{
                    margin: 0,
                    fontWeight: "bold",
                    color: "#e67e22",
                  }}
                >
                  ₹ {item.price}
                </p>
              </div>

              <button
                disabled={!restaurant.isOpen}
                onClick={() => handleAddToCart(item.id)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: restaurant.isOpen
                    ? "#27ae60"
                    : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: restaurant.isOpen
                    ? "pointer"
                    : "not-allowed",
                  fontWeight: "bold",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => {
                  if (restaurant.isOpen) {
                    e.target.style.backgroundColor = "#219150";
                  }
                }}
                onMouseOut={(e) => {
                  if (restaurant.isOpen) {
                    e.target.style.backgroundColor = "#27ae60";
                  }
                }}
              >
                {restaurant.isOpen ? "Add +" : "Closed"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Restaurant;