import React, { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext";

let hasFetchedOrdersBefore = false;
let globalOrdersCache = null;

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-800 border border-sky-200";
    case "PREPARING":
      return "bg-orange-100 text-orange-800 border border-orange-200";
    case "READY":
      return "bg-purple-100 text-purple-800 border border-purple-200";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-800 border border-orange-200";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 border border-rose-200";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-200";
  }
};

const getNextStatuses = (status) => {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["PREPARING", "CANCELLED"];
    case "PREPARING":
      return ["READY", "CANCELLED"];
    case "READY":
      return ["OUT_FOR_DELIVERY"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED"];
    default:
      return [];
  }
};

function OrderCard({ order, loadingId, onStatusChange, onViewDetails }) {
  const isUpdating = loadingId === order.id;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 flex flex-col justify-between h-full w-full max-w-full overflow-hidden box-border">
      {/* Header Info */}
      <div className="w-full min-w-0">
        <div className="flex justify-between items-start gap-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Order ID</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium truncate">
                #{order.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate w-full">
              {order.user.name}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 min-w-0 w-full">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.145-.44.02-1.27.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span className="truncate">{order.user.phone}</span>
            </p>
          </div>

          <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide ${getStatusColor(order.status)}`}>
            {order.status.replaceAll("_", " ")}
          </span>
        </div>

        {/* Short Order Summary / Items Preview */}
        <div className="mt-4 pt-4 border-t border-slate-50 w-full min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Items Preview</p>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar w-full min-w-0">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs sm:text-sm text-slate-600 gap-2 w-full min-w-0">
                <span className="truncate font-medium flex-1 min-w-0">
                  {item.menuItem.name} <span className="text-slate-400 text-[10px] whitespace-nowrap ml-1">x {item.quantity}</span>
                </span>
                <span className="text-slate-500 font-mono shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-sm w-full min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-xs text-slate-400 block truncate">Total Amount</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono truncate block">₹{order.totalAmount}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] sm:text-xs text-slate-400 block">Payment</span>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span className="font-semibold text-slate-700 text-[10px] sm:text-xs truncate max-w-[70px]">{order.paymentMethod}</span>
              <span className={`w-2 h-2 shrink-0 rounded-full ${order.paymentStatus ? "bg-emerald-500" : "bg-amber-400"}`} title={order.paymentStatus ? "Paid" : "Pending"} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 border border-slate-200/60 w-full min-w-0"
        >
          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">Details</span>
        </button>

        {order.status === "DELIVERED" ? (
          <div className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-100 w-full min-w-0">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="truncate">Completed</span>
          </div>
        ) : order.status === "CANCELLED" ? (
          <div className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-rose-50 text-rose-700 font-semibold text-xs rounded-xl border border-rose-100 w-full min-w-0">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="truncate">Cancelled</span>
          </div>
        ) : (
          <div className="flex-1 relative w-full min-w-0">
            <select
              disabled={isUpdating}
              value=""
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="w-full appearance-none bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm px-3 py-2 pr-8 rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none text-center truncate"
            >
              <option value="" disabled className="text-slate-800 bg-white">
                {isUpdating ? "Updating..." : "Next Step"}
              </option>
              {getNextStatuses(order.status).map((status) => (
                <option key={status} value={status} className="text-slate-800 bg-white text-left font-medium">
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/80 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onStatusChange, loadingId }) {
  const isUpdating = loadingId === order.id;

  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm w-full h-full box-border">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-150 box-border">
        <div className="px-4 py-4 sm:px-6 sm:py-5 bg-slate-50 border-b border-slate-100 flex items-start sm:items-center justify-between gap-2 w-full">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Order Detail</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getStatusColor(order.status)}`}>
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800 mt-1 truncate">
              Order #{order.id.slice(-8).toUpperCase()}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-200/70 transition text-slate-400 shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 custom-scrollbar w-full min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 w-full min-w-0">
            <div className="min-w-0 w-full">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <h3 className="font-bold text-slate-800 text-sm truncate w-full">{order.user.name}</h3>
              <p className="text-xs text-slate-600 mt-1 truncate w-full">📞 {order.user.phone}</p>
              {order.user.email && <p className="text-xs text-slate-600 mt-0.5 truncate w-full">✉️ {order.user.email}</p>}
            </div>
            <div className="mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 min-w-0 w-full">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Timeline</p>
              <div className="space-y-1 text-xs text-slate-600 min-w-0 w-full">
                <p className="truncate w-full">📅 Received: <strong className="break-words">{formattedDate}</strong></p>
                <p className="truncate w-full">💳 Payment: <strong className="truncate">{order.paymentMethod}</strong></p>
                <p className="truncate w-full">
                  🏷️ Status: <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${order.paymentStatus ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{order.paymentStatus ? "PAID" : "PENDING"}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="w-full min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</p>
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 w-full text-xs sm:text-sm text-slate-700 font-medium break-words">
              {order.deliveryAddress || "No delivery address"}
            </div>
          </div>

          <div className="w-full min-w-0">
            <div className="flex justify-between items-center mb-2 min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Items</p>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-md shrink-0">
                {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items
              </span>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl w-full min-w-0">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 w-full min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate w-full">{item.menuItem.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate w-full">₹{item.price} per item</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-700 block">Qty: {item.quantity}</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 w-full min-w-0">
            <div className="flex justify-between text-xs text-slate-500 w-full">
              <span>Subtotal</span>
              <span className="font-mono">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2 w-full">
              <span>Grand Total</span>
              <span className="text-orange-600 font-mono">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 w-full min-w-0">
          <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center shrink-0">
            Close
          </button>
          {!["DELIVERED", "CANCELLED"].includes(order.status) && (
            <select
              disabled={isUpdating}
              value=""
              onChange={(e) => {
                onStatusChange(order.id, e.target.value);
                onClose();
              }}
              className="w-full sm:w-auto bg-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-xl outline-none appearance-none text-center shrink-0"
            >
              <option value="" disabled>Update Status</option>
              {getNextStatuses(order.status).map((status) => (
                <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState(() => globalOrdersCache || []);
  const [loadingId, setLoadingId] = useState(null);
  const { refreshDashboard } = useDashboard();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    if (!hasFetchedOrdersBefore) {
      fetchOrders();
      hasFetchedOrdersBefore = true;
    }
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 10000); 
    return () => clearInterval(intervalId);
  }, []);

  const updateOrdersState = (newOrders) => {
    globalOrdersCache = newOrders;
    setOrders(newOrders);
  };

  const fetchOrders = async () => {
    try {
      const { getRestaurantOrders } = await import("../services/order.service").catch(() => ({}));
      if (getRestaurantOrders) {
        const data = await getRestaurantOrders();
        updateOrdersState(data);
        setIsSimulated(false);
      } else {
        throw new Error("Local service module not available.");
      }
    } catch (error) {
      setIsSimulated(true);
      const savedOrders = localStorage.getItem("sandbox_restaurant_orders");
      if (savedOrders) {
        updateOrdersState(JSON.parse(savedOrders));
      } else {
        localStorage.setItem("sandbox_restaurant_orders", JSON.stringify([]));
        updateOrdersState([]);
      }
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      setLoadingId(orderId);
      const serviceModule = await import("../services/order.service").catch(() => ({}));

      if (serviceModule && serviceModule.updateOrderStatus) {
        await serviceModule.updateOrderStatus(orderId, status);
        const updated = orders.map((o) => {
          if (o.id === orderId) {
            const updatedOrder = { ...o, status };
            if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(updatedOrder);
            return updatedOrder;
          }
          return o;
        });
        updateOrdersState(updated);
        await fetchOrders();
        await refreshDashboard();
        setLoadingId(null);
      } else {
        setTimeout(() => {
          const updated = orders.map((o) => {
            if (o.id === orderId) {
              const updatedOrder = { ...o, status };
              if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(updatedOrder);
              return updatedOrder;
            }
            return o;
          });
          updateOrdersState(updated); 
          refreshDashboard();
          localStorage.setItem("sandbox_restaurant_orders", JSON.stringify(updated));
          setLoadingId(null);
        }, 600);
      }
    } catch (error) {
      setLoadingId(null);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const resetDemoData = () => {
    localStorage.setItem("sandbox_restaurant_orders", JSON.stringify([]));
    updateOrdersState([]);
  };

  const filteredOrders = orders.filter((order) => {
    const tabMatches =
      activeTab === "ALL" ||
      (activeTab === "ACTIVE" && !["DELIVERED", "CANCELLED"].includes(order.status)) ||
      (activeTab === "COMPLETED" && order.status === "DELIVERED") ||
      (activeTab === "CANCELLED" && order.status === "CANCELLED");

    const query = searchQuery.toLowerCase();
    const searchMatches =
      !searchQuery ||
      order.user.name.toLowerCase().includes(query) ||
      order.user.phone.includes(query) ||
      order.id.toLowerCase().includes(query);

    return tabMatches && searchMatches;
  });

  return (
    <div className="w-full max-w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden box-border">
      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 box-border min-w-0">

        {/* Navigation & Header */}
        <div className="w-full flex flex-col gap-3 mb-5 min-w-0">
          <div className="min-w-0 w-full">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 truncate">
              Restaurant Orders
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 truncate">
              Monitor incoming requests and kitchen workflows.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search customer, phone, or id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-none mb-6">
          <div className="flex border-b border-slate-200 gap-4 sm:gap-6 pb-1 w-max min-w-full">
            {[
              { id: "ALL", label: "All Orders", count: orders.length },
              { id: "ACTIVE", label: "Active Prep", count: orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status)).length },
              { id: "COMPLETED", label: "Delivered", count: orders.filter(o => o.status === "DELIVERED").length },
              { id: "CANCELLED", label: "Cancelled", count: orders.filter(o => o.status === "CANCELLED").length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-xs sm:text-sm font-bold tracking-tight border-b-2 transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${activeTab === tab.id
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Orders Display */}
        {filteredOrders.length === 0 ? (
          <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center max-w-lg mx-auto mt-4">
            <h2 className="text-lg font-bold text-slate-800">No Orders Found</h2>
            <p className="text-slate-500 text-xs mt-1">
              Adjust your filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                loadingId={loadingId}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Detailed Modal Window Overlay */}
        {showModal && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            loadingId={loadingId}
            onStatusChange={handleStatusChange}
            onClose={() => {
              setShowModal(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Orders;