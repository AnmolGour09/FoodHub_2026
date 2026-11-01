
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  Heart,
  Share2,
  Utensils,
} from "lucide-react";

import { getRestaurantById } from "../services/restaurant.service";
import { addToCart } from "../services/cart.service";

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85";

const DEFAULT_FOOD =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

function getImage(item) {
  return (
    item?.imageUrl ||
    item?.image ||
    item?.image_url ||
    item?.photo ||
    DEFAULT_FOOD
  );
}

function getItemId(item) {
  return item?.id ?? item?._id;
}

function isVegetarian(item) {
  return (
    item?.isVeg === true ||
    item?.isVegetarian === true ||
    item?.foodType === "VEG" ||
    item?.type === "VEG"
  );
}

function getRestaurantData(response) {
  return (
    response?.data?.restaurant ??
    response?.data?.data?.restaurant ??
    response?.data?.data ??
    response?.data ??
    response?.restaurant ??
    response
  );
}

function Restaurant() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Cart quantities displayed during this page session.
  const [cartItems, setCartItems] = useState({});
  const [addingItems, setAddingItems] = useState({});
  const [toast, setToast] = useState(null);

  // Fetch restaurant once per restaurant ID.
  // No loading animation and no automatic polling.
  useEffect(() => {
    let active = true;

    async function fetchRestaurant() {
      setLoading(true);
      setError("");

      try {
        const response = await getRestaurantById(id);
        const data = getRestaurantData(response);

        if (!active) return;

        if (!data || typeof data !== "object") {
          setError("Restaurant data was not returned by the server.");
          return;
        }

        setRestaurant(data);
      } catch (err) {
        if (!active) return;

        console.error("Failed to load restaurant:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load this restaurant. Please try again."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchRestaurant();
    } else {
      setError("Restaurant ID is missing.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  // Automatically dismiss toast notifications.
  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const menuItems = useMemo(() => {
    if (Array.isArray(restaurant?.menuItems)) {
      return restaurant.menuItems;
    }

    if (Array.isArray(restaurant?.menu)) {
      return restaurant.menu;
    }

    return [];
  }, [restaurant]);

  const categories = useMemo(() => {
    const values = menuItems
      .map((item) => {
        const category = item?.category?.name ?? item?.category;

        return typeof category === "string" ? category.trim() : "";
      })
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [menuItems]);

  const isOpen =
    restaurant?.isOpen ??
    restaurant?.isCurrentlyOpen ??
    false;

  const filteredMenuItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const category = item?.category?.name ?? item?.category ?? "";

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory;

      const matchesSearch =
        String(item?.name || "").toLowerCase().includes(query) ||
        String(item?.description || "").toLowerCase().includes(query);

      const matchesVeg = !filterVegOnly || isVegetarian(item);

      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [menuItems, selectedCategory, searchQuery, filterVegOnly]);

  const cartItemCount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotalAmount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleAddToCart = async (item) => {
    const itemId = getItemId(item);

    if (!itemId) {
      showToast("This menu item has no valid ID.", "error");
      return;
    }

    if (!isOpen) {
      showToast("This restaurant is currently closed.", "error");
      return;
    }

    if (addingItems[itemId]) return;

    setAddingItems((previous) => ({
      ...previous,
      [itemId]: true,
    }));

    try {
      await addToCart(itemId);

      setCartItems((previous) => {
        const existing = previous[itemId];

        return {
          ...previous,
          [itemId]: {
            quantity: (existing?.quantity || 0) + 1,
            price: Number(item.price) || 0,
            name: item.name,
          },
        };
      });

      showToast(`${item.name || "Item"} added to cart.`);
    } catch (err) {
      console.error("Failed to add to cart:", err);

      showToast(
        err?.response?.data?.message ||
          "Failed to add item to cart.",
        "error"
      );
    } finally {
      setAddingItems((previous) => ({
        ...previous,
        [itemId]: false,
      }));
    }
  };

  // Updates this page's local quantity only.
  // Connect a cart update/remove API to persist quantity changes.
  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((previous) => {
      const current = previous[itemId];

      if (!current) return previous;

      const nextQuantity = current.quantity + delta;
      const updated = { ...previous };

      if (nextQuantity <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = {
          ...current,
          quantity: nextQuantity,
        };
      }

      return updated;
    });
  };

  const handleShare = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable.");
      }

      await navigator.clipboard.writeText(window.location.href);
      showToast("Restaurant link copied.");
    } catch {
      showToast("Unable to copy the restaurant link.", "error");
    }
  };

  // Hide the page while the initial request is pending.
  // No spinner, animated icon, or loading message is rendered.
  if (loading) {
    return null;
  }

  if (!restaurant || error) {
    return (
      <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />

        <h2 className="text-xl font-bold text-slate-900">
          Restaurant unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error || "This restaurant could not be found."}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const restaurantName = restaurant.name || "Restaurant";

  const restaurantImage =
    restaurant.bannerImage ||
    restaurant.coverImage ||
    restaurant.bannerImg ||
    restaurant.imageUrl ||
    restaurant.image ||
    DEFAULT_BANNER;

  const logoImage =
    restaurant.logoUrl ||
    restaurant.logo ||
    restaurant.logoImage;

  const deliveryTime =
    restaurant.estimatedDelivery ||
    restaurant.deliveryTime ||
    "Delivery time varies";

  const rating = restaurant.rating ?? restaurant.averageRating;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans text-slate-800">
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-xl ${
            toast.type === "error"
              ? "bg-red-600"
              : "bg-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          ) : (
            <Check className="h-5 w-5 shrink-0" />
          )}

          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero banner */}
      <section className="relative h-56 overflow-hidden bg-slate-900 sm:h-72 lg:h-80">
        <img
          src={restaurantImage}
          alt={restaurantName}
          className="h-full w-full object-cover opacity-60"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_BANNER;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-8 text-white sm:px-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Discover your next favourite
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {restaurantName}
          </h1>
        </div>
      </section>

      <main className="relative z-10 mx-auto -mt-5 max-w-6xl px-4 sm:-mt-8 sm:px-6">
        {/* Restaurant details */}
        <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                    isOpen
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOpen ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />

                  {isOpen ? "Open Now" : "Currently Closed"}
                </span>

                {restaurant.cuisine && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {Array.isArray(restaurant.cuisine)
                      ? restaurant.cuisine.join(" · ")
                      : restaurant.cuisine}
                  </span>
                )}
              </div>

              {logoImage && (
                <img
                  src={logoImage}
                  alt={`${restaurantName} logo`}
                  className="mb-4 h-16 w-16 rounded-xl border border-slate-100 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {restaurantName}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                {restaurant.description ||
                  "Explore the restaurant menu and discover something delicious."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
                {rating != null && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">
                      {rating}
                    </span>
                  </div>
                )}

                {restaurant.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    <span>{restaurant.city}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-500" />
                  <span>{deliveryTime}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 self-end sm:self-start">
              <button
                type="button"
                aria-label="Add restaurant to favourites"
                aria-pressed={isFavorite}
                onClick={() => setIsFavorite((value) => !value)}
                className={`rounded-full border p-3 transition ${
                  isFavorite
                    ? "border-rose-200 bg-rose-50 text-rose-500"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-rose-500" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                aria-label="Copy restaurant link"
                onClick={handleShare}
                className="rounded-full border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isOpen && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p>
                <strong>This restaurant is currently closed.</strong>{" "}
                You can browse the menu, but ordering is unavailable.
              </p>
            </div>
          )}
        </section>

        {/* Search and filters */}
        <section className="sticky top-3 z-20 mb-7 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search dishes in this menu..."
                aria-label="Search menu"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-bold transition ${
                      selectedCategory === category
                        ? "bg-slate-900 text-white shadow"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={filterVegOnly}
                  onChange={(event) =>
                    setFilterVegOnly(event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                Veg Only
              </label>
            </div>
          </div>
        </section>

        {/* Menu */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
              <Utensils className="h-5 w-5 text-emerald-600" />
              {selectedCategory === "All"
                ? "Our Menu"
                : selectedCategory}
            </h2>

            <span className="shrink-0 text-sm text-slate-500">
              {filteredMenuItems.length} items
            </span>
          </div>

          {filteredMenuItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
              <Info className="mx-auto mb-3 h-10 w-10 text-slate-400" />

              <h3 className="font-bold text-slate-800">
                No menu items found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another category or change your search.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setFilterVegOnly(false);
                }}
                className="mt-4 font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredMenuItems.map((item, index) => {
                const itemId = getItemId(item);
                const quantity = cartItems[itemId]?.quantity || 0;
                const isVeg = isVegetarian(item);
                const isAdding = Boolean(addingItems[itemId]);

                return (
                  <article
                    key={itemId ?? `menu-item-${index}`}
                    className={`flex min-w-0 gap-4 rounded-2xl border bg-white p-4 transition ${
                      isOpen
                        ? "border-slate-200/80 hover:border-slate-300 hover:shadow-lg"
                        : "border-slate-200 opacity-70"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            title={
                              isVeg ? "Vegetarian" : "Non-vegetarian"
                            }
                            className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                              isVeg
                                ? "border-emerald-600"
                                : "border-red-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isVeg
                                  ? "bg-emerald-600"
                                  : "bg-red-600"
                              }`}
                            />
                          </span>

                          {item.isBestseller && (
                            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800">
                              BESTSELLER
                            </span>
                          )}
                        </div>

                        <h3 className="break-words text-base font-bold leading-snug text-slate-900">
                          {item.name || "Menu item"}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500 sm:text-sm">
                          {item.description ||
                            "Freshly prepared and ready to enjoy."}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <span className="text-base font-extrabold text-slate-900">
                          {formatPrice(item.price)}
                        </span>

                        {quantity > 0 ? (
                          <div className="flex items-center gap-1 rounded-xl bg-emerald-600 p-1 text-white">
                            <button
                              type="button"
                              aria-label={`Remove one ${item.name}`}
                              onClick={() =>
                                handleUpdateQuantity(itemId, -1)
                              }
                              className="rounded-lg p-1.5 hover:bg-emerald-700"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-6 text-center text-sm font-bold">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Add one ${item.name}`}
                              disabled={!isOpen || isAdding}
                              onClick={() => handleAddToCart(item)}
                              className="rounded-lg p-1.5 hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!isOpen || isAdding}
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <Plus className="h-4 w-4" />
                            ADD
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-32">
                      <img
                        src={getImage(item)}
                        alt={item.name || "Menu item"}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_FOOD;
                        }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating cart summary */}
      {cartItemCount > 0 && (
        <div className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl sm:inset-x-auto sm:w-[calc(100%-2rem)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl bg-emerald-500 p-2.5">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-400">
                {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} added
              </p>

              <p className="truncate text-base font-extrabold">
                Total: {formatPrice(cartTotalAmount)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/cart";
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            View Cart
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Restaurant;
