import { useEffect, useState, useCallback, useRef } from "react";

import Hero from "../components/Hero";
import CategorySlider from "../components/CategorySlider";
import RestaurantList from "../components/RestaurantList";
import Footer from "../components/Footer";

import {
  getRestaurants,
  searchRestaurants,
} from "../services/restaurant.service";

/* ---------------- Time Helpers ---------------- */

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
  if (!openingTime || !closingTime) return true;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = parseToMinutes(openingTime);
  const end = parseToMinutes(closingTime);
  if (start <= end) return currentMinutes >= start && currentMinutes <= end;
  return currentMinutes >= start || currentMinutes <= end;
};

const attachDynamicStatus = (restaurants = []) => {
  return restaurants.map((restaurant) => ({
    ...restaurant,
    isOpen: isRestaurantOpenNow(restaurant.openingTime, restaurant.closingTime),
  }));
};

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // In-Memory Cache Store
  const categoryCache = useRef({});

  /* ---------------- Search Debounce ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- Fetch Restaurants ---------------- */
  const fetchRestaurants = useCallback(
    async (showLoader = true, signal = null) => {
      const cacheKey = `${debouncedSearch.trim()}_${selectedCategory}`;

      // Check if data exists in cache
      if (categoryCache.current[cacheKey]) {
        setRestaurants(categoryCache.current[cacheKey]);
        setLoading(false);
        showLoader = false;
      } else if (showLoader) {
        setLoading(true);
      }

      try {
        let response;
        if (debouncedSearch.trim()) {
          response = await searchRestaurants(
            debouncedSearch,
            selectedCategory,
            { signal }
          );
        } else {
          response = await getRestaurants(selectedCategory, { signal });
        }

        const list =
          response?.data?.restaurants ||
          response?.restaurants ||
          response?.data ||
          response ||
          [];

        const formattedList = attachDynamicStatus(list);

        categoryCache.current[cacheKey] = formattedList;
        setRestaurants(formattedList);
      } catch (err) {
        if (
          err.name !== "CanceledError" &&
          err.name !== "AbortError" &&
          err.code !== "ERR_CANCELED"
        ) {
          console.error("Fetch Error:", err);
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [debouncedSearch, selectedCategory]
  );

  /* ---------------- Initial Fetch + Race Condition Cancellation ---------------- */
  useEffect(() => {
    const controller = new AbortController();
    fetchRestaurants(true, controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchRestaurants]);

  /* ---------------- Poll Server Every 15 Seconds ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRestaurants(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchRestaurants]);

  /* ---------------- Update Open/Closed Status Every 10 Seconds ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setRestaurants((prevRestaurants) => {
        let changed = false;
        const updated = prevRestaurants.map((restaurant) => {
          const newStatus = isRestaurantOpenNow(
            restaurant.openingTime,
            restaurant.closingTime
          );
          if (newStatus !== restaurant.isOpen) {
            changed = true;
            return { ...restaurant, isOpen: newStatus };
          }
          return restaurant;
        });
        return changed ? updated : prevRestaurants;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-x-hidden">
      <Hero search={search} setSearch={setSearch} />

      <CategorySlider
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <RestaurantList restaurants={restaurants} loading={loading} />

      <Footer />
    </div>
  );
}

export default Home;