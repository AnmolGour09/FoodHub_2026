import { Link } from "react-router-dom";
import {
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaMotorcycle,
} from "react-icons/fa";

function RestaurantCard({ restaurant }) {
  return (
    <Link
  to={restaurant.isOpen ? `/restaurant/${restaurant.id}` : "#"}
  onClick={(e) => {
    if (!restaurant.isOpen) {
      e.preventDefault();
      alert("Restaurant is currently closed.");
    }
  }}
  className={`group block rounded-3xl overflow-hidden shadow-md transition-all duration-300 ${
    restaurant.isOpen
      ? "bg-white hover:shadow-2xl hover:-translate-y-2"
      : "bg-gray-100 opacity-70 cursor-not-allowed"
  }`}
>
      {/* Image */}
      <div className="relative overflow-hidden h-48 sm:h-56 lg:h-60">
        <img
          src={
            restaurant.image ||
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
          }
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />

        {/* Rating */}
        <div className="absolute top-3 right-3 bg-green-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs sm:text-sm font-semibold shadow">
          <FaStar size={12} />
          {restaurant.rating || "4.5"}
        </div>

        {/* Offer */}
        <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
          50% OFF
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">

        {/* Name + Status */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-bold text-lg sm:text-xl line-clamp-1">
            {restaurant.name}
          </h2>

          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
              restaurant.isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
          {restaurant.description}
        </p>

        {/* City + ETA */}
        <div className="flex justify-between items-center mt-5 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500" />
            <span className="truncate">
              {restaurant.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FaClock className="text-orange-500" />
            <span>25-35 min</span>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
            <FaMotorcycle />
            FREE DELIVERY
          </div>

          <span className="text-orange-500 font-semibold text-sm group-hover:translate-x-1 transition">
            VIEW MENU →
          </span>

        </div>

      </div>
    </Link>
  );
}

export default RestaurantCard;