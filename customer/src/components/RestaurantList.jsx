import RestaurantCard from "./RestaurantCard";

function RestaurantList({ restaurants, loading }) {
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <h2 className="mt-6 text-xl font-semibold text-gray-700">
            Loading Restaurants...
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait while we fetch delicious food.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* Heading */}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">

        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Restaurants Near You
          </h2>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Discover the best food around your location
          </p>
        </div>

        <div className="bg-orange-100 text-orange-600 font-semibold px-5 py-3 rounded-full w-fit">
          {restaurants.length} Restaurants
        </div>

      </div>

      {restaurants.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border py-20 text-center">

          <div className="text-7xl">
            🍽️
          </div>

          <h2 className="mt-5 text-3xl font-bold">
            No Restaurants Found
          </h2>

          <p className="mt-3 text-gray-500">
            Try searching with another category or keyword.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      )}

    </section>
  );
}

export default RestaurantList;