import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignedOrders } from "../services/delivery.service";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);
const fetchOrders = async () => {
  try {
    setLoading(true);

    const data = await getAssignedOrders();

    data.forEach((order) => {
  console.log(order.id, order.status);
}); // ADD THIS

    setOrders(data || []);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Derive counts for dashboard metrics
const activeOrders = orders.filter(
  (o) => o.status !== "DELIVERED"
);

const completedOrders = orders.filter(
  (o) => o.status === "DELIVERED"
);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xl">
              🚚
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Delivery Portal
              </h1>
              <p className="text-xs text-gray-400">Driver Dashboard</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition"
          >
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-700 shadow-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Welcome back, Partner! 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Here is your active delivery workload for today.
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition text-center shadow-lg shadow-emerald-900/30 active:scale-[0.98]"
          >
            View All Orders
          </button>
        </div>

        {/* Stats Grid - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Total Assigned */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-400">
                Total Assigned
              </span>
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-lg">
                📦
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {loading ? "..." : orders.length}
              </span>
            </div>
          </div>

          {/* Card 2: Active / Pending */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-400">
                Active Deliveries
              </span>
              <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg text-lg">
                ⚡
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                {loading ? "..." : activeOrders.length}
              </span>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-400">
                Completed
              </span>
              <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg text-lg">
                ✅
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-400">
                {loading ? "..." : completedOrders.length}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions / Recent Orders Preview */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Recent Deliveries
            </h3>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs sm:text-sm font-medium text-emerald-400 hover:underline"
            >
              See all
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Loading order data...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              No orders assigned right now.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order._id || order.id}
                  onClick={() => navigate(`/orders/${order._id || order.id}`)}
                  className="flex items-center justify-between bg-gray-700/50 hover:bg-gray-700 p-3.5 sm:p-4 rounded-xl border border-gray-600/50 cursor-pointer transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">
                      Order #{order._id?.slice(-6) || order.id}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                      {order.address || "Address provided in details"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      order.status === "Delivered"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}