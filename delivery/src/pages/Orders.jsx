import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../services/order.service";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "OUT_FOR_DELIVERY":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "DELIVERED":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600"
          >
            ←
          </button>

          <h1 className="text-2xl font-bold">
            Assigned Orders
          </h1>
        </div>

        <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
          {orders.length} Orders
        </span>
      </header>

      {/* Body */}
      <div className="max-w-5xl mx-auto p-6">

        {loading ? (
          <div className="text-center py-20">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-10 text-center">
            <h2 className="text-xl font-bold">
              No Assigned Orders
            </h2>

            <p className="text-gray-400 mt-2">
              Waiting for new delivery assignments.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (

              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-green-500 transition"
              >

                <div className="flex justify-between items-center">

                  <div>
                    <h2 className="text-xl font-bold">
                      {order.restaurant?.name}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      Order ID : {order.id.slice(-6)}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-4">

                  <div>
                    <p className="text-gray-400 text-sm">
                      Customer
                    </p>

                    <p>{order.user?.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">
                      Amount
                    </p>

                    <p className="text-green-400 font-bold">
                      ₹{order.totalAmount}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm">
                      Delivery Address
                    </p>

                    <p>{order.deliveryAddress}</p>
                  </div>

                </div>

                <div className="text-right mt-5 text-green-400 font-semibold">
                  View Details →
                </div>

              </Link>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Orders;