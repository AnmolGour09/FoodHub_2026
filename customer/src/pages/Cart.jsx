
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Clock,
  ChevronRight,
  Utensils,
  AlertCircle,
} from "lucide-react";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cart.service";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setError("");

      const cartData = await getCart();

      if (!Array.isArray(cartData?.items)) {
        throw new Error("Invalid cart response");
      }

      setCart(cartData);
    } catch (err) {
      console.error(
        "Error fetching cart:",
        err.response?.data || err.message
      );

      setError("Unable to load your cart. Please try again.");
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      try {
        const cartData = await getCart();

        if (!Array.isArray(cartData?.items)) {
          throw new Error("Invalid cart response");
        }

        if (active) {
          setCart(cartData);
        }
      } catch (err) {
        console.error("Cart error:", err);

        if (active) {
          setError("Unable to load your cart. Please try again.");
        }
      }
    };

    loadCart();

    return () => {
      active = false;
    };
  }, []);

  // Calculate cart totals
  const items = cart?.items || [];

  const totalItemsCount = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.menuItem?.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const deliveryFee =
    subtotal === 0 || subtotal > 500 ? 0 : 40;

  const taxesAndCharges = Math.round(subtotal * 0.05);

  const finalTotal = Math.max(
    0,
    subtotal + deliveryFee + taxesAndCharges - discount
  );

  // Update item quantity
  const updateQuantity = async (item, newQuantity) => {
    try {
      setUpdatingItem(item.id);

      if (newQuantity <= 0) {
        await removeCartItem(item.id);
      } else {
        await updateCartItem(item.id, newQuantity);
      }

      await fetchCart();
    } catch (err) {
      console.error("Quantity update error:", err);
      alert("Unable to update cart. Please try again.");
    } finally {
      setUpdatingItem(null);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingItem(itemId);

      await removeCartItem(itemId);

      await fetchCart();
    } catch (err) {
      console.error("Remove item error:", err);
      alert("Unable to remove item. Please try again.");
    } finally {
      setUpdatingItem(null);
    }
  };

  // Apply promo code
  const handleApplyPromo = (e) => {
    e.preventDefault();

    const code = promoCode.trim().toUpperCase();

    if (!code) return;

    if (code === "FOODHUB50") {
      setDiscount(50);
      setPromoApplied(true);
    } else if (code === "WELCOME100") {
      setDiscount(100);
      setPromoApplied(true);
    } else {
      setDiscount(0);
      setPromoApplied(false);
      alert("Invalid promo code. Try FOODHUB50 or WELCOME100.");
    }
  };

  // Error state
  if (error && !cart) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Unable to load cart
          </h2>

          <p className="text-sm text-slate-500 mb-5">
            {error}
          </p>

          <button
            onClick={fetchCart}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No loading screen or spinner
  // Wait for the initial API response before rendering cart data.
  if (!cart) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">

      {/* Main Cart Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">

        {/* Page Heading */}
        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm transition"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                My Cart
              </h1>

              <p className="text-sm text-slate-500">
                Review your items before checkout
              </p>
            </div>

          </div>

          {items.length > 0 && (
            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full">
              {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
            </span>
          )}

        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* Empty Cart */}
        {items.length === 0 ? (

          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-12">

            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Your cart is empty
            </h3>

            <p className="text-slate-500 text-sm mb-6">
              Looks like you haven't added anything to your cart yet.
              Explore our restaurants and order your favourite food!
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 transition"
            >
              <Utensils className="w-4 h-4" />
              Browse Restaurants
            </button>

          </div>

        ) : (

          /* Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

            {/* LEFT COLUMN - CART ITEMS */}
            <div className="lg:col-span-7 space-y-4">

              {items.map((item) => (

                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    updatingItem === item.id
                      ? "opacity-60 pointer-events-none"
                      : ""
                  }`}
                >

                  {/* Product Information */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">

                    {item.menuItem?.image ||
                    item.menuItem?.imageUrl ? (

                      <img
                        src={
                          item.menuItem.image ||
                          item.menuItem.imageUrl
                        }
                        alt={item.menuItem.name}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                      />

                    ) : (

                      <div className="w-20 h-20 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <Utensils className="w-8 h-8" />
                      </div>

                    )}

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        {item.menuItem?.isVeg !== undefined && (
                          <span
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                              item.menuItem.isVeg
                                ? "border-emerald-600"
                                : "border-rose-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.menuItem.isVeg
                                  ? "bg-emerald-600"
                                  : "bg-rose-600"
                              }`}
                            />
                          </span>
                        )}

                        <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
                          {item.menuItem?.name || "Food Item"}
                        </h3>

                      </div>

                      <p className="text-slate-500 text-xs mt-1 line-clamp-1">
                        {item.menuItem?.description || "Delicious food"}
                      </p>

                      <p className="font-extrabold text-orange-500 text-lg mt-1">
                        ₹{item.menuItem?.price}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Item total: ₹
                        {Number(item.menuItem?.price || 0) *
                          Number(item.quantity || 0)}
                      </p>

                    </div>

                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">

                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">

                      <button
                        disabled={updatingItem === item.id}
                        onClick={() =>
                          updateQuantity(item, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-9 text-center font-bold text-slate-900 text-sm">
                        {item.quantity}
                      </span>

                      <button
                        disabled={updatingItem === item.id}
                        onClick={() =>
                          updateQuantity(item, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                    </div>

                    {/* Remove Button */}
                    <button
                      disabled={updatingItem === item.id}
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>

                  </div>

                </div>

              ))}

              {/* Delivery Information */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-900 text-xs sm:text-sm">

                <Clock className="w-5 h-5 text-emerald-600 shrink-0" />

                <div>
                  <span className="font-bold">
                    Standard Delivery:
                  </span>{" "}
                  Estimated delivery within 30–40 minutes after order
                  confirmation. Actual delivery times may vary.
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN - ORDER SUMMARY */}
            <div className="lg:col-span-5 space-y-4">

              {/* Promo Code */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">

                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-orange-500" />
                  Apply Promo Code
                </h3>

                <form
                  onSubmit={handleApplyPromo}
                  className="flex gap-2"
                >

                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoApplied(false);
                      setDiscount(0);
                    }}
                    className="flex-1 min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />

                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition"
                  >
                    Apply
                  </button>

                </form>

                <p className="text-[10px] text-slate-400 mt-3">
                  Demo codes: FOODHUB50 and WELCOME100
                </p>

                {promoApplied && (
                  <div className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Promo code applied successfully!
                  </div>
                )}

              </div>

              {/* Bill Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

                <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                  Bill Details
                </h2>

                <div className="space-y-4 text-sm mt-4">

                  {/* Item Total */}
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Item Total ({totalItemsCount} items)
                    </span>

                    <span className="font-semibold text-slate-900">
                      ₹{subtotal}
                    </span>
                  </div>

                  {/* Delivery Fee */}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>

                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-900">
                        ₹{deliveryFee}
                      </span>
                    )}
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & Charges (5%)</span>

                    <span className="font-semibold text-slate-900">
                      ₹{taxesAndCharges}
                    </span>
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Promo Discount</span>

                      <span className="font-bold">
                        - ₹{discount}
                      </span>
                    </div>
                  )}

                  {/* Final Total */}
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-base font-black text-slate-900">

                    <span>Total Amount</span>

                    <span className="text-orange-500 text-xl">
                      ₹{finalTotal}
                    </span>

                  </div>

                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate("/checkout")}
                  disabled={items.length === 0 || updatingItem !== null}
                  className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-[0.99]"
                >
                  Proceed To Checkout
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Secure Payment */}
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs pt-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secure checkout</span>
                </div>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default Cart;
