
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import RestaurantModal from "../components/RestaurantModal";
import {
  getRestaurant,
  updateRestaurant,
  uploadRestaurantLogo,
} from "../services/restaurant.service";

let globalRestaurantCache = null;
let hasFetchedRestaurantBefore = false;

const parseToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const value = timeStr.trim();

  if (/AM|PM/i.test(value)) {
    const [time, modifier] = value.split(/\s+/);
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
  } catch (error) {
    console.error(error);
    return true;
  }
};

function Restaurant() {
  const [restaurant, setRestaurant] = useState(
    () => globalRestaurantCache
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState(() => ({
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
    deliveryFee: globalRestaurantCache?.deliveryFee ?? "",
    minimumOrder: globalRestaurantCache?.minimumOrder ?? "",
    isOpen: globalRestaurantCache?.isOpen ?? true,
  }));

  const updateRestaurantState = (data) => {
    globalRestaurantCache = data;
    setRestaurant(data);
  };

  const fetchRestaurant = async () => {
    try {
      const response = await getRestaurant();
      const data = response?.data;

      if (!data) {
        throw new Error("Restaurant data was not returned");
      }

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
        deliveryFee: data.deliveryFee ?? "",
        minimumOrder: data.minimumOrder ?? "",
        isOpen: data.isOpen ?? true,
      });

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    let active = true;

    if (!hasFetchedRestaurantBefore) {
      hasFetchedRestaurantBefore = true;

      fetchRestaurant().catch((error) => {
        hasFetchedRestaurantBefore = false;

        if (active) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load restaurant"
          );
        }
      });
    }

    return () => {
      active = false;
    };
  }, []);

  // Keep the clock-based restaurant status fresh.
  useEffect(() => {
    const interval = setInterval(() => {
      setRestaurant((previous) =>
        previous ? { ...previous } : previous
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Release the temporary preview URL when replaced or unmounted.
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleSubmit = async () => {
    try {
      await updateRestaurant(formData);
      const response = await getRestaurant();
      const updatedData = response?.data;

      if (updatedData) {
        updateRestaurantState(updatedData);
      }

      toast.success("Restaurant updated successfully!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update restaurant"
      );
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);

      await uploadRestaurantLogo(selectedImage);

      // Fetch the persisted image URL from the backend.
      await fetchRestaurant();

      setSelectedImage(null);
      setPreviewImage(null);

      toast.success("Restaurant image updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to upload restaurant image"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const currentStatus =
    restaurant?.isOpen &&
    isRestaurantOpenNow(
      restaurant?.openingTime,
      restaurant?.closingTime
    );

  const imageUrl = previewImage || restaurant?.logo;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 box-border min-w-0 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 w-full min-w-0 box-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Restaurant Profile
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl"
          >
            Edit Restaurant
          </button>
        </div>

        {/* Restaurant Logo Upload */}
        <section className="mb-8 rounded-2xl border border-slate-200 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            Restaurant Profile Image
          </h2>

          <p className="text-sm text-slate-500 mb-5">
            Upload your restaurant logo or profile image.
            JPG, PNG images up to 5 MB.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Restaurant profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🍽️</span>
              )}
            </div>

            <div className="w-full min-w-0">
              <label
                htmlFor="restaurant-image"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Choose restaurant image
              </label>

              <input
                id="restaurant-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-orange-700 hover:file:bg-orange-100"
              />

              {selectedImage && (
                <p className="mt-2 text-xs text-slate-500 break-words">
                  Selected: {selectedImage.name}
                </p>
              )}

              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!selectedImage || uploadingImage}
                className="mt-4 w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage
                  ? "Uploading..."
                  : "Upload Image"}
              </button>
            </div>
          </div>
        </section>

        {/* Restaurant Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <Info label="Restaurant Name" value={restaurant?.name} />
          <Info label="Phone" value={restaurant?.phone} />
          <Info label="Email" value={restaurant?.email} />
          <Info label="City" value={restaurant?.city} />
          <Info label="State" value={restaurant?.state} />
          <Info label="Pincode" value={restaurant?.pincode} />
          <Info label="Opening Time" value={restaurant?.openingTime} />
          <Info label="Closing Time" value={restaurant?.closingTime} />
          <Info
            label="Delivery Fee"
            value={
              restaurant?.deliveryFee != null
                ? `₹${restaurant.deliveryFee}`
                : "-"
            }
          />
          <Info
            label="Minimum Order"
            value={
              restaurant?.minimumOrder != null
                ? `₹${restaurant.minimumOrder}`
                : "-"
            }
          />
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
                "-"
              )
            }
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
            Description
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words">
            {restaurant?.description || "-"}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
            Address
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words">
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
    <div className="w-full min-w-0">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </h3>
      <div className="text-sm sm:text-base font-medium text-slate-800 break-words">
        {value ?? "-"}
      </div>
    </div>
  );
}

export default Restaurant;
