import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import {
  MapPin,
  Search,
  CheckCircle,
  ShieldCheck,
  Navigation,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

import { placeOrder } from "../services/order.service";
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/payment.service";

// --------------------------------------------------
// LEAFLET MARKER ICON FIX
// --------------------------------------------------

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Default map center: Pune
const DEFAULT_POSITION = [18.5204, 73.8567];

// --------------------------------------------------
// MAP CLICK HANDLER
// --------------------------------------------------

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

// --------------------------------------------------
// CHECKOUT COMPONENT
// --------------------------------------------------

function Checkout() {
  const navigate = useNavigate();

  // Address states
  const [searchAddress, setSearchAddress] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_POSITION);
  const [mapKey, setMapKey] = useState(0);

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Success modal states
  const [successModal, setSuccessModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

  // Custom notification popup states
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // --------------------------------------------------
  // CUSTOM POPUP FUNCTIONS
  // --------------------------------------------------

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

  // --------------------------------------------------
  // SEARCH ADDRESS
  // --------------------------------------------------

  const handleSearchAddress = async (e) => {
    e.preventDefault();

    if (searchAddress.trim().length < 5) {
      showPopup("Please enter a complete delivery address.");
      return;
    }

    setSearching(true);
    closePopup();
    setSearchResults([]);
    setSelectedLocation(null);

    try {
      const url = new URL(
        "https://nominatim.openstreetmap.org/search"
      );

      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");
      url.searchParams.set("countrycodes", "in");
      url.searchParams.set("q", searchAddress.trim());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Unable to search address. Please try again.");
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        showPopup("Address not found. Please enter a valid address.");
        return;
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Address search error:", error);
      showPopup(
        error.message || "Unable to search your delivery address."
      );
    } finally {
      setSearching(false);
    }
  };

  // --------------------------------------------------
  // SELECT SEARCH RESULT
  // --------------------------------------------------

  const selectAddress = (result) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      showPopup("Invalid map location. Please select another address.");
      return;
    }

    setSelectedLocation({
      latitude,
      longitude,
      address: result.display_name,
    });

    setSearchAddress(result.display_name);
    setMapCenter([latitude, longitude]);
    setMapKey((prev) => prev + 1);

    setSearchResults([]);
    closePopup();
  };

  // --------------------------------------------------
  // REVERSE GEOCODING
  // --------------------------------------------------

  const handleMapLocationSelect = async (latitude, longitude) => {
    setVerifying(true);
    setSelectedLocation(null);
    setSearchResults([]);

    try {
      const url = new URL(
        "https://nominatim.openstreetmap.org/reverse"
      );

      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", latitude);
      url.searchParams.set("lon", longitude);
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Unable to verify this map location.");
      }

      const result = await response.json();

      if (!result || !result.display_name) {
        throw new Error("No address found for this location.");
      }

      setSelectedLocation({
        latitude,
        longitude,
        address: result.display_name,
      });

      setSearchAddress(result.display_name);
      setMapCenter([latitude, longitude]);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      showPopup(
        error.message || "Unable to identify selected location."
      );
    } finally {
      setVerifying(false);
    }
  };

  // --------------------------------------------------
  // PLACE ORDER
  // --------------------------------------------------

  const handlePlaceOrder = async () => {
    if (!selectedLocation) {
      showPopup(
        "Please search and select a verified delivery location."
      );
      return;
    }

    if (additionalDetails.trim().length < 3) {
      showPopup(
        "Please enter your house, flat or landmark details."
      );
      return;
    }

    if (placingOrder) return;

    const deliveryAddress = `${selectedLocation.address}, ${additionalDetails.trim()}`;

    setPlacingOrder(true);
    closePopup();

    try {
      const response = await placeOrder({
        deliveryAddress,
        paymentMethod,
      });

      const order = response?.data;

      if (!order?.id) {
        throw new Error(
          "Order ID was not returned by the server."
        );
      }

      // CASH ON DELIVERY
      if (paymentMethod === "COD") {
        setPlacingOrder(false);
        setSuccessModal(true);
        return;
      }

      // ONLINE PAYMENT - RAZORPAY
      const razorpayOrder = await createPaymentOrder(order.id);

      if (!razorpayOrder?.id) {
        throw new Error("Unable to initialize online payment.");
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK is not loaded. Please refresh the page."
        );
      }

      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        throw new Error("Razorpay configuration is missing.");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "FoodHub",
        description: "Food Order Payment",
        order_id: razorpayOrder.id,

        handler: async function (paymentResponse) {
          try {
            await verifyPayment(paymentResponse);

            setPaymentReference(
              paymentResponse.razorpay_payment_id
            );

            setSuccessModal(true);
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            showPopup(
              error.response?.data?.message ||
              "Payment verification failed. Please contact support."
            );
          } finally {
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
          },
        },

        theme: {
          color: "#ff6900",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);

        showPopup(
          response.error?.description ||
          "Payment failed. Please try again."
        );

        setPlacingOrder(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Order error:", error);

      showPopup(
        error.response?.data?.message ||
        error.message ||
        "Failed to place order. Please try again."
      );

      setPlacingOrder(false);
    }
  };

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">

        {/* PAGE TITLE */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Checkout
            </h1>
            <p className="text-sm text-slate-500">
              Confirm your delivery location and payment.
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* DELIVERY ADDRESS SECTION */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-orange-500" size={21} />
              <h2 className="text-lg font-extrabold text-slate-900">
                Delivery Address
              </h2>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Search your delivery address and select the correct location from the map results.
            </p>

            {/* SEARCH FORM */}
            <form
              onSubmit={handleSearchAddress}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => {
                  setSearchAddress(e.target.value);
                  setSelectedLocation(null);
                  setSearchResults([]);
                  closePopup();
                }}
                placeholder="Search area, street, building or pincode..."
                className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <button
                type="submit"
                disabled={searching}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition"
              >
                {searching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* SEARCH RESULTS */}
            {searchResults.length > 0 && (
              <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <p className="px-4 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                  Select your correct location
                </p>

                {searchResults.map((result) => (
                  <button
                    type="button"
                    key={result.place_id}
                    onClick={() => selectAddress(result)}
                    className="w-full flex items-start gap-3 text-left p-4 border-t border-slate-100 hover:bg-orange-50 transition"
                  >
                    <MapPin
                      size={18}
                      className="text-orange-500 shrink-0 mt-1"
                    />
                    <span className="text-sm text-slate-700">
                      {result.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* MAP */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800">
                  Select Location on Map
                </h3>
                <span className="text-xs text-slate-400">
                  Click to move pin
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 relative">
                <MapContainer
                  key={mapKey}
                  center={mapCenter}
                  zoom={selectedLocation ? 16 : 12}
                  scrollWheelZoom={true}
                  style={{
                    height: "340px",
                    width: "100%",
                    zIndex: 1,
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler
                    onLocationSelect={handleMapLocationSelect}
                  />

                  {selectedLocation && (
                    <Marker
                      position={[
                        selectedLocation.latitude,
                        selectedLocation.longitude,
                      ]}
                      draggable={true}
                      eventHandlers={{
                        dragend: (e) => {
                          const position = e.target.getLatLng();
                          handleMapLocationSelect(
                            position.lat,
                            position.lng
                          );
                        },
                      }}
                    >
                      <Popup>
                        Your delivery location
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Map data © OpenStreetMap contributors.
              </p>
            </div>

            {/* LOCATION VERIFICATION */}
            {verifying && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-700 text-sm">
                <Loader2 size={19} className="animate-spin" />
                Verifying selected map location...
              </div>
            )}

            {selectedLocation && !verifying && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                  <CheckCircle size={19} />
                  Address Verified on Map
                </div>
                <p className="text-sm text-slate-700">
                  {selectedLocation.address}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Latitude: {selectedLocation.latitude.toFixed(6)}
                  {" | "}
                  Longitude: {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {/* ADDITIONAL ADDRESS DETAILS */}
            <div className="mt-5">
              <label className="block font-bold text-sm mb-2 text-slate-700">
                House / Flat / Landmark Details
              </label>
              <textarea
                rows={3}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Example: Flat 302, ABC Apartments, near City Mall..."
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 resize-none bg-slate-50"
              />
              <p className="text-xs text-slate-400 mt-2">
                Add details that help the delivery partner find your door.
              </p>
            </div>
          </section>

          {/* PAYMENT SECTION */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              Select Payment Method
            </h2>

            <div className="space-y-3">
              {[
                {
                  value: "COD",
                  label: "Cash On Delivery",
                  description: "Pay when your order arrives.",
                },
                {
                  value: "ONLINE",
                  label: "Pay Online (Razorpay)",
                  description: "Secure online payment.",
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === method.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-800">
                      {method.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {method.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* PLACE ORDER BUTTON */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <button
              onClick={handlePlaceOrder}
              disabled={
                placingOrder ||
                verifying ||
                !selectedLocation
              }
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placingOrder ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order
                  <Navigation size={18} />
                </>
              )}
            </button>

            <div className="flex justify-center items-center gap-2 mt-4 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-500" />
              Secure Checkout
            </div>
          </section>

        </div>
      </main>

      {/* CUSTOM NOTIFICATION POPUP */}
      {popup.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-7 text-center shadow-2xl relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close popup"
            >
              <X size={18} />
            </button>

            <div
              className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
                popup.type === "success"
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              {popup.type === "success" ? (
                <CheckCircle
                  size={42}
                  className="text-green-600"
                />
              ) : (
                <AlertCircle
                  size={42}
                  className="text-red-500"
                />
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              {popup.type === "success" ? "Success!" : "Oops!"}
            </h2>

            <p className="text-sm text-slate-500 mb-6">
              {popup.message}
            </p>

            <button
              onClick={closePopup}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition"
            >
              Okay, Got It
            </button>
          </div>
        </div>
      )}

      {/* ORDER / PAYMENT SUCCESS MODAL */}
      {successModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle
                size={45}
                className="text-green-600"
              />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {paymentMethod === "COD"
                ? "Order Placed Successfully!"
                : "Payment Successful!"}
            </h2>

            <p className="text-slate-500 text-sm mb-6">
              {paymentMethod === "COD"
                ? "Your order has been placed. Pay when your food arrives."
                : "Your payment has been verified successfully. Thank you for ordering with FoodHub!"}
            </p>

            {paymentReference && (
              <div className="bg-slate-50 rounded-xl p-3 mb-6">
                <p className="text-xs text-slate-400 mb-1">
                  Payment ID
                </p>
                <p className="text-sm font-semibold text-slate-700 break-all">
                  {paymentReference}
                </p>
              </div>
            )}

            <button
              onClick={() => navigate("/orders", { replace: true })}
              className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition shadow-lg shadow-orange-500/20"
            >
              View My Orders
            </button>

            <p className="text-xs text-slate-400 mt-4">
              Thank you for choosing FoodHub ❤️
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Checkout;