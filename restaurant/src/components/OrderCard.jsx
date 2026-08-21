import React from "react";

function OrderCard({
  order,
  onViewDetails,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PREPARING":
        return "bg-orange-100 text-orange-700";

      case "READY":
        return "bg-purple-100 text-purple-700";

      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition mb-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">
            Order #{order.id.slice(-6)}
          </h2>

          <p className="text-gray-700 mt-2">
            <strong>Customer :</strong>{" "}
            {order.user.name}
          </p>

          <p className="text-gray-700">
            <strong>Phone :</strong>{" "}
            {order.user.phone}
          </p>

          <p className="text-gray-700">
            <strong>Items :</strong>{" "}
            {order.items.length}
          </p>

          <p className="text-lg font-semibold mt-2">
            ₹{order.totalAmount}
          </p>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <hr className="my-5" />

      <div className="flex justify-between items-center">
        <div>
          <p>
            <strong>Payment :</strong>{" "}
            {order.paymentMethod}
          </p>

          <p>
            <strong>Status :</strong>{" "}
            {order.paymentStatus
              ? "Paid"
              : "Pending"}
          </p>
        </div>

        <button
          onClick={() => onViewDetails(order)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default OrderCard;