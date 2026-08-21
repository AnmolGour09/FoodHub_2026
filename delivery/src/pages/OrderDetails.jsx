import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getOrderById,
  acceptOrder,
  deliverOrder,
} from "../services/delivery.service";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptOrder(id);
      fetchOrder();
      alert("Order Accepted");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverOrder(id);
      fetchOrder();
      alert("Order Delivered");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
        Loading...
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
        Order Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <button
        onClick={() => navigate("/orders")}
        className="mb-6 bg-gray-700 px-4 py-2 rounded"
      >
        ← Back
      </button>

      <div className="bg-gray-800 rounded-xl p-6 space-y-6">

        <h1 className="text-2xl font-bold">
          Order #{order.id.slice(-6)}
        </h1>

        <div>
          <h2 className="font-bold text-emerald-400 mb-2">
            Restaurant
          </h2>

          <p>{order.restaurant.name}</p>
          <p>{order.restaurant.address}</p>
        </div>

        <div>
          <h2 className="font-bold text-emerald-400 mb-2">
            Customer
          </h2>

          <p>{order.user.name}</p>
          <p>{order.user.phone}</p>
        </div>

        <div>
          <h2 className="font-bold text-emerald-400 mb-2">
            Delivery Address
          </h2>

          <p>{order.deliveryAddress}</p>
        </div>

        <div>
          <h2 className="font-bold text-emerald-400 mb-2">
            Items
          </h2>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-gray-700 py-2"
            >
              <span>
                {item.menuItem.name} × {item.quantity}
              </span>

              <span>₹{item.price}</span>
            </div>
          ))}
        </div>

        <div className="text-xl font-bold">
          Total : ₹{order.totalAmount}
        </div>

        <div>
          Status :
          <span className="ml-2 text-emerald-400 font-bold">
            {order.status}
          </span>
        </div>

        <div className="flex gap-4">

          {order.status === "READY" && (
            <button
              onClick={handleAccept}
              className="bg-blue-600 px-5 py-2 rounded"
            >
              Accept Order
            </button>
          )}

          {order.status === "OUT_FOR_DELIVERY" && (
            <button
              onClick={handleDeliver}
              className="bg-green-600 px-5 py-2 rounded"
            >
              Deliver Order
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default OrderDetails;