import React from "react";

function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
}) {
  if (!isOpen || !order) return null;

  const getNextStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "CONFIRMED";

      case "CONFIRMED":
        return "PREPARING";

      case "PREPARING":
        return "READY";

      case "READY":
        return "OUT_FOR_DELIVERY";

      case "OUT_FOR_DELIVERY":
        return "DELIVERED";

      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[700px] max-h-[90vh] overflow-y-auto p-8">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Order Details
          </h2>

          <button
            onClick={onClose}
            className="text-3xl"
          >
            ×
          </button>
        </div>

        <hr />

        {/* Order Info */}

        <div className="mt-6 space-y-3">

          <p>
            <strong>Order ID :</strong>{" "}
            {order.id}
          </p>

          <p>
            <strong>Order Time :</strong>{" "}
            {new Date(
              order.createdAt
            ).toLocaleString()}
          </p>

          <p>
            <strong>Status :</strong>{" "}
            {order.status.replaceAll("_", " ")}
          </p>

        </div>

        {/* Customer */}

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">
            Customer Details
          </h3>

          <p>
            <strong>Name :</strong>{" "}
            {order.user.name}
          </p>

          <p>
            <strong>Phone :</strong>{" "}
            {order.user.phone}
          </p>

          <p>
            <strong>Delivery Address :</strong>{" "}
            {order.deliveryAddress}
          </p>
        </div>

        {/* Payment */}

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">
            Payment Details
          </h3>

          <p>
            <strong>Method :</strong>{" "}
            {order.paymentMethod}
          </p>

          <p>
            <strong>Status :</strong>{" "}
            {order.paymentStatus
              ? "Paid"
              : "Pending"}
          </p>
        </div>

        {/* Items */}

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">
            Ordered Items
          </h3>

          <div className="space-y-3">

            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2"
              >
                <div>
                  {item.menuItem.name}
                </div>

                <div>
                  {item.quantity} × ₹{item.price}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Bill */}

        <div className="mt-8 border rounded-lg p-4">

          <div className="flex justify-between mb-2">
            <span>Total</span>

            <span>
              ₹{order.totalAmount}
            </span>
          </div>

        </div>

        {/* Action */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Close
          </button>

          {nextStatus && (
            <button
              onClick={() =>
                onStatusChange(
                  order.id,
                  nextStatus
                )
              }
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              Move to{" "}
              {nextStatus.replaceAll(
                "_",
                " "
              )}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default OrderDetailsModal;