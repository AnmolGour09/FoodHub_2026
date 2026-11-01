
import { useEffect, useState, useCallback } from "react";

import Hero from "../components/Hero";
import CategorySlider from "../components/CategorySlider";
import RestaurantList from "../components/RestaurantList";
import Footer from "../components/Footer";

import {
  getRestaurants,
  searchRestaurants,
} from "../services/restaurant.service";

/* -----------------------------------------
   Shared cache survives Home unmounting
----------------------------------------- */

const categoryCache = new Map();
let homeScrollPosition = 0;

/* -----------------------------------------
   Time helpers
----------------------------------------- */

const parseToMinutes = (timeStr) => {
  if (!timeStr) return null;

  const value = timeStr.trim();
  const match = value.match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const modifier = match[3]?.toUpperCase();

  if (
    minutes > 59 ||
    hours > (modifier ? 12 : 23) ||
    (modifier && hours < 1)
  ) {
    return null;
  }

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const getCurrentMinutes = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const hours = Number(
    parts.find((part) => part.type === "hour").value
  );

  const minutes = Number(
    parts.find((part) => part.type === "minute").value
  );

  return hours * 60 + minutes;
};

const isRestaurantOpenNow = (openingTime, closingTime) => {
  const start = parseToMinutes(openingTime);
  const end = parseToMinutes(closingTime);

  if (start === null || end === null || start === end) {
    return false;
  }

  const current = getCurrentMinutes();

  if (start < end) {
    return current >= start && current < end;
  }

  // Supports overnight schedules, e.g. 18:00–02:00.
  return current >= start || current < end;
};

const attachDynamicStatus = (restaurants = []) => {
  if (!Array.isArray(restaurants)) return [];

  return restaurants.map((restaurant) => ({
    ...restaurant,
    isOpen: isRestaurantOpenNow(
      restaurant.openingTime,
      restaurant.closingTime
    ),
  }));
};

/* -----------------------------------------
   Home component
----------------------------------------- */

function Home() {
  const [restaurants, setRestaurants] = useState(() => {
    return categoryCache.get("_") || [];
  });

  const [loading, setLoading] = useState(
    () => !categoryCache.has("_")
  );

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* -----------------------------------------
     Search debounce
  ----------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* -----------------------------------------
     Fetch restaurant data
  ----------------------------------------- */

  const fetchRestaurants = useCallback(
    async (showLoader = true, signal) => {
      const cacheKey =
        `${debouncedSearch.trim()}_${selectedCategory}`;

      // Show cached results immediately.
      if (categoryCache.has(cacheKey)) {
        setRestaurants(categoryCache.get(cacheKey));
        setLoading(false);
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
          response = await getRestaurants(
            selectedCategory,
            { signal }
          );
        }

        // Supports common API response structures.
        const payload = response?.data ?? response;

        const list = Array.isArray(payload?.restaurants)
          ? payload.restaurants
          : Array.isArray(payload?.data?.restaurants)
            ? payload.data.restaurants
            : Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data)
                ? payload.data
                : [];

        const formattedList = attachDynamicStatus(list);

        categoryCache.set(cacheKey, formattedList);
        setRestaurants(formattedList);
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.name !== "AbortError" &&
          error.code !== "ERR_CANCELED"
        ) {
          console.error("Fetch restaurants failed:", error);
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, selectedCategory]
  );

  /* -----------------------------------------
     Fetch when search/category changes
  ----------------------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    fetchRestaurants(true, controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchRestaurants]);

  /* -----------------------------------------
     Background refresh
  ----------------------------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRestaurants(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchRestaurants]);

  /* -----------------------------------------
     Update open status every 10 seconds
  ----------------------------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      setRestaurants((previous) => {
        let changed = false;

        const updated = previous.map((restaurant) => {
          const isOpen = isRestaurantOpenNow(
            restaurant.openingTime,
            restaurant.closingTime
          );

          if (isOpen !== restaurant.isOpen) {
            changed = true;
            return { ...restaurant, isOpen };
          }

          return restaurant;
        });

        if (changed) {
          const cacheKey =
            `${debouncedSearch.trim()}_${selectedCategory}`;

          categoryCache.set(cacheKey, updated);
          return updated;
        }

        return previous;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [debouncedSearch, selectedCategory]);

  /* -----------------------------------------
     Restore and save scroll position
  ----------------------------------------- */

  useEffect(() => {
    window.scrollTo(0, homeScrollPosition);

    return () => {
      homeScrollPosition = window.scrollY;
    };
  }, []);

  /* -----------------------------------------
     Render
  ----------------------------------------- */

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-x-hidden">
      <Hero
        search={search}
        setSearch={setSearch}
      />

      <CategorySlider
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <RestaurantList
        restaurants={restaurants}
        loading={loading}
      />

      <Footer />
    </div>
  );
}

export default Home;
