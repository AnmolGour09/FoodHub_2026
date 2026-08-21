import { useEffect, useState } from "react";
import { getOrders, cancelOrder } from "../services/order.service";

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING": return "#f39c12";
    case "CONFIRMED": return "#3498db";
    case "PREPARING": return "#e67e22";
    case "READY": return "#9b59b6";
    case "OUT_FOR_DELIVERY": return "#e67e22";
    case "DELIVERED": return "#27ae60";
    case "CANCELLED": return "#e74c3c";
    default: return "#7f8c8d";
  }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (isBackground = false) => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Poll every 5 seconds to get status updates automatically
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(orderId);
      fetchOrders(true);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to cancel order.");
    }
  };

  if (loading) return <div style={styles.center}>Loading your orders...</div>;
  if (orders.length === 0) return <div style={styles.center}>No orders found.</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Orders</h1>
      {orders.map((order) => (
        <div key={order.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={{ margin: 0 }}>{order.restaurant.name}</h3>
            <span style={{ ...styles.badge, backgroundColor: getStatusColor(order.status) }}>
              {order.status.replaceAll("_", " ")}
            </span>
          </div>
          
          <div style={styles.details}>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            <p><strong>Deliver to:</strong> {order.deliveryAddress}</p>
          </div>

          <div style={styles.itemsList}>
            <strong>Items:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              {order.items.map((item) => (
                <li key={item.id}>{item.menuItem.name} (x{item.quantity})</li>
              ))}
            </ul>
          </div>

          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <button style={styles.cancelBtn} onClick={() => handleCancel(order.id)}>
              Cancel Order
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { width: "100%", maxWidth: "600px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" },
  header: { marginBottom: "30px", textAlign: "center" },
  center: { textAlign: "center", marginTop: "50px" },
  card: { border: "1px solid #ddd", padding: "20px", borderRadius: "12px", marginBottom: "20px", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  badge: { padding: "4px 10px", borderRadius: "20px", color: "white", fontSize: "0.8rem", fontWeight: "bold" },
  details: { fontSize: "0.9rem", color: "#555" },
  itemsList: { marginTop: "15px", fontSize: "0.9rem" },
  cancelBtn: { marginTop: "15px", backgroundColor: "#e74c3c", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }
};

export default Orders;