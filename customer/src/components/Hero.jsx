import { Search, MapPin, Clock, Utensils } from "lucide-react";

function Hero({ search, setSearch }) {
  return (
    <section
      className="relative w-full min-h-[100vh] md:min-h-[700px] flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Badge */}
        <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg inline-flex items-center gap-2">
          <span>🍔</span>
          <span className="hidden sm:inline">India's Favourite</span> Food Delivery
        </span>

        {/* Heading */}
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight w-full">
          Discover
          <span className="text-orange-400"> Delicious </span>
          Food
        </h1>

        {/* Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-2xl leading-relaxed">
          Find the best restaurants, delicious dishes and exclusive offers delivered
          to your doorstep.
        </p>

        {/* Search Input */}
        <div className="mt-8 w-full max-w-3xl relative">
          <Search
            size={20}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6"
          />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 md:h-16 rounded-full bg-white pl-12 sm:pl-16 pr-6 text-sm sm:text-base md:text-lg shadow-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 w-full max-w-5xl">
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-white border border-white/10">
            <Utensils size={28} className="mx-auto text-orange-400 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3">500+</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">Restaurants</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-white border border-white/10">
            <Clock size={28} className="mx-auto text-orange-400 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3">30 min</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">Fast Delivery</p>
          </div>

          {/* This item spans both columns on mobile to keep the layout balanced */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-white border border-white/10 col-span-2 md:col-span-1">
            <MapPin size={28} className="mx-auto text-orange-400 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3">50+</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">Categories</p>
          </div>

        </div>

        {/* Call to Action Button */}
        <button className="mt-10 md:mt-12 bg-orange-500 hover:bg-orange-600 text-white px-8 sm:px-10 py-3 md:py-4 rounded-full text-base md:text-lg font-bold transition-transform shadow-lg hover:scale-105 active:scale-95">
          Explore Restaurants
        </button>

      </div>
    </section>
  );
}

export default Hero;