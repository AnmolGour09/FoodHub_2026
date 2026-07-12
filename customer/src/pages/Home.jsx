import { useEffect, useState } from "react";
import { getRestaurants } from "../services/restaurant.service";

function Home() {

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRestaurants = async () => {

      try {

        const response = await getRestaurants();

        console.log(response);

        setRestaurants(response.data.restaurants);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchRestaurants();

  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (

    <div>

      <h1>FoodHub Restaurants</h1>

      {
        restaurants.map((restaurant) => (

          <div
            key={restaurant.id}
            style={{
              border: "1px solid gray",
              margin: "10px",
              padding: "10px",
            }}
          >

            <h3>{restaurant.name}</h3>

            <p>{restaurant.description}</p>

            <p>⭐ {restaurant.rating}</p>

            <p>{restaurant.city}</p>

          </div>

        ))
      }

    </div>

  );
}

export default Home;