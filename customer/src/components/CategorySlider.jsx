import React, { useEffect, useState, useRef } from "react";

// MOCKED SERVICE FOR PREVIEW (Replace with your actual import)
// import { getCategories } from "../services/category.service";
const getCategories = async () => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { name: "Pizza" },
          { name: "Burger" },
          { name: "Biryani" },
          { name: "Chinese" },
          { name: "Desserts" },
          { name: "Drinks" },
          { name: "North indian" },
          { name: "South indian" },
          { name: "Veg pizza" },
        ]),
      500
    )
  );
};

const categoryIcons = {
  "All": "🍽️",
  "Pizza": "🍕",
  "Burger": "🍔",
  "Biryani": "🍛",
  "Chinese": "🥡",
  "Desserts": "🍰",
  "Drinks": "🥤",
  "Cold drink": "🥤",
  "North indian": "🍲",
  "South indian": "🥘",
  "Veg pizza": "🧀",
};

export default function CategorySlider({
  selectedCategory = "",
  setSelectedCategory = () => {},
}) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth scroll handler for desktop navigation arrows
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    // Added max-w-7xl and mx-auto here to center the entire block
    <section className="max-w-7xl mx-auto w-full py-8 md:py-12">
      
      {/* Updated padding to match standard max-w-7xl layouts */}
      <div className="flex items-center justify-between mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Explore Categories
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-1.5 font-medium">
            Find your favourite cuisine
          </p>
        </div>

        {/* Desktop Navigation Arrows - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all duration-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all duration-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className="
            flex
            gap-3
            sm:gap-4
            md:gap-5
            overflow-x-auto
            py-4
            px-4 sm:px-6 lg:px-8 /* Updated padding to match the header container */
            snap-x
            snap-mandatory
            scroll-smooth
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {/* ALL Categories Button */}
          <button
            onClick={() => setSelectedCategory("")}
            className={`
              flex-shrink-0
              snap-start
              w-20
              h-24
              sm:w-24
              sm:h-28
              md:w-28
              md:h-32
              lg:w-32
              lg:h-36
              rounded-2xl
              border
              flex
              flex-col
              justify-center
              items-center
              transition-all
              duration-300
              ${
                selectedCategory === ""
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:shadow-md"
              }
            `}
          >
            <span className="text-3xl sm:text-4xl lg:text-5xl drop-shadow-sm">
              🍽️
            </span>
            <span className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-bold tracking-wide">
              All
            </span>
          </button>

          {isLoading
            ? // Loading Skeletons
              [...Array(6)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex-shrink-0 snap-start w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 lg:w-32 lg:h-36 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse flex flex-col justify-center items-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full mb-3"></div>
                  <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            : // Actual Categories
              categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`
                    flex-shrink-0
                    snap-start
                    w-20
                    h-24
                    sm:w-24
                    sm:h-28
                    md:w-28
                    md:h-32
                    lg:w-32
                    lg:h-36
                    rounded-2xl
                    border
                    flex
                    flex-col
                    justify-center
                    items-center
                    transition-all
                    duration-300
                    ${
                      selectedCategory === category.name
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:shadow-md"
                    }
                  `}
                >
                  <span className="text-3xl sm:text-4xl lg:text-5xl drop-shadow-sm">
                    {categoryIcons[category.name] || "🍽️"}
                  </span>
                  <span className="mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-center px-1.5 leading-tight tracking-wide">
                    {category.name}
                  </span>
                </button>
              ))}
        </div>
      </div>
    </section>
  );
}