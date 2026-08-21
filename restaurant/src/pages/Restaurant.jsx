import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import RestaurantModal from "../components/RestaurantModal";
import {
  getRestaurant,
  updateRestaurant,
} from "../services/restaurant.service";

// 1. Add global cache variables outside the component structure
let globalRestaurantCache = null;
let hasFetchedRestaurantBefore = false;

const parseToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const value = timeStr.trim();

  if (value.toUpperCase().includes("AM") || value.toUpperCase().includes("PM")) {
    const [time, modifier] = value.split(" ");

    let [hours, minutes] = time.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
};

const isRestaurantOpenNow = (openingTime, closingTime) => {
  try {
    if (!openingTime || !closingTime) return true;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const start = parseToMinutes(openingTime);
    const end = parseToMinutes(closingTime);

    if (start <= end) {
      return currentMinutes >= start && currentMinutes <= end;
    }

    return currentMinutes >= start || currentMinutes <= end;
  } catch (err) {
    console.error(err);
    return true;
  }
};

function Restaurant() {
  // 2. Initialize layout state immediately from global cache if available
  const [restaurant, setRestaurant] = useState(() => globalRestaurantCache);
  const [showModal, setShowModal] = useState(false);

  // Initialize form data using cache fields if they exist, keeping values synchronized
  const [formData, setFormData] = useState({
    name: globalRestaurantCache?.name || "",
    description: globalRestaurantCache?.description || "",
    phone: globalRestaurantCache?.phone || "",
    email: globalRestaurantCache?.email || "",
    address: globalRestaurantCache?.address || "",
    city: globalRestaurantCache?.city || "",
    state: globalRestaurantCache?.state || "",
    pincode: globalRestaurantCache?.pincode || "",
    openingTime: globalRestaurantCache?.openingTime || "",
    closingTime: globalRestaurantCache?.closingTime || "",
    deliveryFee: globalRestaurantCache?.deliveryFee || "",
    minimumOrder: globalRestaurantCache?.minimumOrder || "",
    isOpen: globalRestaurantCache?.isOpen ?? true,
  });

  const updateRestaurantState = (data) => {
    globalRestaurantCache = data;
    setRestaurant(data);
  };

  // ---------------- Fetch Restaurant ----------------

  const fetchRestaurant = async () => {
    try {
      const response = await getRestaurant();
      const data = response?.data || {};

      updateRestaurantState(data);

      setFormData({
        name: data.name || "",
        description: data.description || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        openingTime: data.openingTime || "",
        closingTime: data.closingTime || "",
        deliveryFee: data.deliveryFee || "",
        minimumOrder: data.minimumOrder || "",
        isOpen: data.isOpen ?? true,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load restaurant"
      );
    }
  };

  useEffect(() => {
    // 3. Only trigger the network request if it has not loaded once yet
    if (!hasFetchedRestaurantBefore) {
      fetchRestaurant();
      hasFetchedRestaurantBefore = true;
    }
  }, []);
  // Refresh restaurant status every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    setRestaurant((prev) =>
      prev ? { ...prev } : prev
    );
  }, 10000); // every 30 sec

  return () => clearInterval(interval);
}, []);

  // ---------------- Update ----------------

  const handleSubmit = async () => {
    try {
      // Optimistic update for zero layout latency
      updateRestaurantState({ ...restaurant, ...formData });

      await updateRestaurant(formData);
      toast.success("Restaurant Updated");
      setShowModal(false);
      fetchRestaurant(); // Background silent sync
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update restaurant"
      );
      fetchRestaurant(); // Revert state structure on server failure
    }
  };
  const currentStatus =
  restaurant &&
  restaurant.isOpen &&
  isRestaurantOpenNow(
    restaurant.openingTime,
    restaurant.closingTime
  );
  

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 box-border min-w-0 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 w-full min-w-0 box-border">
        
        {/* Header - Stacked on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 w-full min-w-0">
          <div className="min-w-0 w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 truncate w-full">
              Restaurant Profile
            </h1>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shrink-0"
          >
            Edit Restaurant
          </button>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full min-w-0">
          <Info label="Restaurant Name" value={restaurant?.name} />
          <Info label="Phone" value={restaurant?.phone} />
          <Info label="Email" value={restaurant?.email} />
          <Info label="City" value={restaurant?.city} />
          <Info label="State" value={restaurant?.state} />
          <Info label="Pincode" value={restaurant?.pincode} />
          <Info label="Opening Time" value={restaurant?.openingTime} />
          <Info label="Closing Time" value={restaurant?.closingTime} />
          <Info label="Delivery Fee" value={restaurant?.deliveryFee !== undefined && restaurant?.deliveryFee !== "" ? `₹${restaurant.deliveryFee}` : ""} />
          <Info label="Minimum Order" value={restaurant?.minimumOrder !== undefined && restaurant?.minimumOrder !== "" ? `₹${restaurant.minimumOrder}` : ""} />
          <Info
  label="Restaurant Status"
  value={
    restaurant ? (
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
          currentStatus
            ? "bg-emerald-100 text-emerald-800"
            : "bg-rose-100 text-rose-800"
        }`}
      >
        {currentStatus ? "OPEN" : "CLOSED"}
      </span>
    ) : (
      ""
    )
  }
/>
        </div>

        {/* Description Section */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-slate-100 w-full min-w-0">
          <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words w-full">
            {restaurant?.description || "-"}
          </p>
        </div>

        {/* Address Section */}
        <div className="mt-6 pt-6 border-t border-slate-100 w-full min-w-0">
          <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Address
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words w-full">
            {restaurant?.address || "-"}
          </p>
        </div>
      </div>

      <RestaurantModal
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="w-full min-w-0 box-border">
      <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </h3>
      <div className="text-sm sm:text-base font-medium text-slate-800 break-words w-full min-w-0">
        {value || "-"}
      </div>
    </div>
  );
}

export default Restaurant;