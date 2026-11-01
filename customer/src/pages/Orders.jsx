import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Utensils,
  CreditCard,
  ShoppingBasket,
  Truck,
  Package,
  CookingPot,
  X,
  Loader2,
  RotateCw,
} from "lucide-react";

import { getOrders, cancelOrder } from "../services/order.service";

// Order status configuration
const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const getStatusConfig = (status) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        bg: "bg-amber-500",
        text: "text-amber-700",
        lightBg: "bg-amber-50",
        border: "border-amber-200",
      };

    case "CONFIRMED":
      return {
        label: "Confirmed",
        bg: "bg-blue-500",
        text: "text-blue-700",
        lightBg: "bg-blue-50",
        border: "border-blue-200",
      };

    case "PREPARING":
      return {
        label: "Preparing",
        bg: "bg-orange-500",
        text: "text-orange-700",
        lightBg: "bg-orange-50",
        border: "border-orange-200",
      };

    case "READY":
      return {
        label: "Ready",
        bg: "bg-purple-500",
        text: "text-purple-700",
        lightBg: "bg-purple-50",
        border: "border-purple-200",
      };

    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        bg: "bg-indigo-500",
        text: "text-indigo-700",
        lightBg: "bg-indigo-50",
        border: "border-indigo-200",
      };

    case "DELIVERED":
      return {
        label: "Delivered",
        bg: "bg-emerald-600",
        text: "text-emerald-700",
        lightBg: "bg-emerald-50",
        border: "border-emerald-200",
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        bg: "bg-rose-500",
        text: "text-rose-700",
        lightBg: "bg-rose-50",
        border: "border-rose-200",
      };

    default:
      return {
        label: status || "Unknown",
        bg: "bg-slate-500",
        text: "text-slate-700",
        lightBg: "bg-slate-50",
        border: "border-slate-200",
      };
  }
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("ALL");
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [expandedAddressId, setExpandedAddressId] = useState(null);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Show custom notification
  const showPopup = (message, type = "error") => {
    setPopup({
      show: true,
      message,
      type,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      message: "",
      type: "error",
    });
  };

  // Fetch orders from backend
  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setRefreshing(true);
      }

      const data = await getOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error.response?.data || error.message
      );

      if (!isBackground) {
        showPopup(
          error.response?.data?.message ||
            "Unable to load your orders. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and automatic refresh
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Cancel order using backend API
  const confirmCancelOrder = async () => {
    if (!cancelModalOrder || cancelling) return;

    try {
      setCancelling(true);

      await cancelOrder(cancelModalOrder.id);

      setCancelModalOrder(null);

      await fetchOrders(true);

      showPopup("Your order has been cancelled successfully.", "success");
    } catch (error) {
      console.error(
        "Cancel order error:",
        error.response?.data || error.message
      );

      setCancelModalOrder(null);

      showPopup(
        error.response?.data?.message ||
          "Unable to cancel this order. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "ACTIVE") {
        return [
          "PENDING",
          "CONFIRMED",
          "PREPARING",
          "READY",
          "OUT_FOR_DELIVERY",
        ].includes(order.status);
      }

      if (activeTab === "COMPLETED") {
        return ["DELIVERED", "CANCELLED"].includes(order.status);
      }

      return true;
    });
  }, [orders, activeTab]);

  // Order counts
  const activeCount = orders.filter((order) =>
    [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
    ].includes(order.status)
  ).length;

  const completedCount = orders.filter((order) =>
    ["DELIVERED", "CANCELLED"].includes(order.status)
  ).length;

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans pb-24">

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">

        {/* PAGE TITLE AND FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Orders
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track live food deliveries and view past orders
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">

            {[
              {
                key: "ALL",
                label: "All Orders",
                count: orders.length,
              },
              {
                key: "ACTIVE",
                label: "Active",
                count: activeCount,
              },
              {
                key: "COMPLETED",
                label: "Past Orders",
                count: completedCount,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[10px] opacity-60">
                  ({tab.count})
                </span>
              </button>
            ))}

          </div>
        </div>

        {/* EMPTY STATE */}
        {filteredOrders.length === 0 ? (

          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 shadow-sm my-8">

            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              No orders found
            </h3>

            <p className="text-slate-500 text-sm mb-6">
              {activeTab === "ALL"
                ? "You haven't placed any orders yet."
                : "You don't have any orders matching this filter."}
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-orange-500/20 inline-flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              Explore Restaurants
            </button>

          </div>

        ) : (

          /* ORDER CARDS */
          <div className="space-y-6">

            {filteredOrders.map((order) => {

              const statusCfg = getStatusConfig(order.status);

              const canCancel = [
                "PENDING",
                "CONFIRMED",
              ].includes(order.status);

              const isExpandedAddr =
                expandedAddressId === order.id;

              const currentIndex =
                STATUS_STEPS.indexOf(order.status);

              const restaurantName =
                order.restaurant?.name || "FoodHub Restaurant";

              const restaurantImage =
                order.restaurant?.image ||
                order.restaurant?.imageUrl;

              const address =
                order.deliveryAddress || "Address unavailable";

              const items = order.items || [];

              return (

                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >

                  {/* CARD HEADER */}
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/40">

                    <div className="flex items-center gap-3">

                      {restaurantImage ? (

                        <img
                          src={restaurantImage}
                          alt={restaurantName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />

                      ) : (

                        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                          <Utensils className="w-6 h-6" />
                        </div>

                      )}

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                          {restaurantName}
                        </h3>

                        <span className="text-xs text-slate-400 font-medium">
                          Order #{String(order.id).slice(-8)} •{" "}
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                    </div>

                    {/* STATUS BADGE */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${statusCfg.lightBg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusCfg.bg}`}
                      />
                      {statusCfg.label}
                    </span>

                  </div>

                  {/* ORDER TRACKING */}
                  {order.status !== "CANCELLED" && (

                    <div className="px-4 sm:px-6 pt-5 pb-4 bg-white border-b border-slate-100">

                      <div className="flex items-center justify-between relative">

                        {/* Progress line */}
                        <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-slate-100 rounded-full" />

                        <div
                          className="absolute top-4 left-[10%] h-1 bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width:
                              currentIndex >= 0
                                ? `${(currentIndex / (STATUS_STEPS.length - 1)) * 80}%`
                                : "0%",
                          }}
                        />

                        {STATUS_STEPS.map((step, index) => {

                          const completed =
                            currentIndex >= index;

                          const current =
                            currentIndex === index;

                          const stepIcons = [
                            <Clock className="w-4 h-4" />,
                            <CheckCircle2 className="w-4 h-4" />,
                            <CookingPot className="w-4 h-4" />,
                            <Truck className="w-4 h-4" />,
                            <Package className="w-4 h-4" />,
                          ];

                          return (

                            <div
                              key={step}
                              className="flex flex-col items-center flex-1 z-10 relative"
                            >

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  completed
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                } ${
                                  current
                                    ? "ring-4 ring-emerald-100 scale-110"
                                    : ""
                                }`}
                              >
                                {stepIcons[index]}
                              </div>

                              <span
                                className={`text-[9px] sm:text-[10px] mt-2 font-bold capitalize text-center ${
                                  completed
                                    ? "text-slate-800"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.replaceAll("_", " ").toLowerCase()}
                              </span>

                            </div>

                          );
                        })}

                      </div>

                    </div>

                  )}

                  {/* CANCELLED NOTICE */}
                  {order.status === "CANCELLED" && (

                    <div className="mx-5 mt-5 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-700 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      This order has been cancelled.
                    </div>

                  )}

                  {/* ORDER BODY */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* ITEMS */}
                    <div className="md:col-span-7 space-y-3">

                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Items Ordered
                      </h4>

                      <div className="space-y-3">

                        {items.map((item) => {

                          const itemName =
                            item.menuItem?.name || "Menu Item";

                          const itemPrice =
                            Number(
                              item.menuItem?.price ??
                              item.price ??
                              0
                            );

                          return (

                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm gap-3"
                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <span className="w-7 h-7 rounded-md bg-slate-100 font-bold text-xs text-slate-600 flex items-center justify-center flex-shrink-0">
                                  {item.quantity}x
                                </span>

                                <span className="font-semibold text-slate-800 truncate">
                                  {itemName}
                                </span>

                              </div>

                              <span className="font-bold text-slate-700 whitespace-nowrap">
                                ₹{(itemPrice * item.quantity).toFixed(2)}
                              </span>

                            </div>

                          );
                        })}

                      </div>

                      {items.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No item details available.
                        </p>
                      )}

                    </div>

                    {/* DELIVERY AND PAYMENT DETAILS */}
                    <div className="md:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-4 text-xs">

                      {/* ADDRESS */}
                      <div>

                        <span className="text-slate-400 font-medium block">
                          Delivery Address
                        </span>

                        <div className="mt-1 text-slate-700 font-semibold flex items-start gap-1.5">

                          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />

                          <div className="min-w-0">

                            <p
                              className={
                                isExpandedAddr
                                  ? "break-words"
                                  : "line-clamp-2"
                              }
                            >
                              {address}
                            </p>

                            {address.length > 50 && (

                              <button
                                onClick={() =>
                                  setExpandedAddressId(
                                    isExpandedAddr ? null : order.id
                                  )
                                }
                                className="text-orange-600 font-bold hover:underline mt-1 text-[11px] flex items-center gap-0.5"
                              >
                                {isExpandedAddr ? (
                                  <>
                                    Show less
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    Show full address
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </button>

                            )}

                          </div>

                        </div>

                      </div>

                      {/* PAYMENT */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 gap-2">

                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">

                          <CreditCard className="w-4 h-4 text-slate-400" />

                          <span>
                            Method:{" "}
                            <strong className="text-slate-900 uppercase">
                              {order.paymentMethod}
                            </strong>
                          </span>

                        </div>

                        <div className="text-right">

                          <span className="text-slate-400 block text-[10px]">
                            Order Total
                          </span>

                          <span className="text-base font-extrabold text-slate-900">
                            ₹{Number(order.totalAmount || 0).toFixed(2)}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* CARD FOOTER */}
                  <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">

                    <span className="text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Updated automatically
                    </span>

                    <div className="flex items-center gap-2">

                      {canCancel && (

                        <button
                          onClick={() => setCancelModalOrder(order)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition"
                        >
                          Cancel Order
                        </button>

                      )}

                      <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Re-order
                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </main>

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalOrder && (

        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in duration-200">

            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>

              <h3 className="text-lg font-extrabold text-slate-900">
                Cancel Order?
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                Are you sure you want to cancel your order from{" "}
                <strong>
                  {cancelModalOrder.restaurant?.name || "this restaurant"}
                </strong>
                ?
              </p>

            </div>

            <div className="flex gap-3 pt-2">

              <button
                disabled={cancelling}
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                disabled={cancelling}
                onClick={confirmCancelOrder}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-rose-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* CUSTOM NOTIFICATION POPUP */}
      {popup.show && (

        <div className="fixed inset-0 z-[110] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="relative bg-white rounded-3xl max-w-sm w-full p-7 text-center shadow-2xl animate-in zoom-in duration-200">

            <button
              onClick={closePopup}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                popup.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {popup.type === "success" ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              {popup.type === "success" ? "Success!" : "Something went wrong"}
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              {popup.message}
            </p>

            <button
              onClick={closePopup}
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              Okay, Got It
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Orders;