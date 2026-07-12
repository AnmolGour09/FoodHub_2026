import { useEffect, useState } from "react";
import { getRestaurants } from "../services/restaurant.service";
import { Link } from "react-router-dom";

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

          <Link
            key={restaurant.id}
            to={`/restaurant/${restaurant.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                border: "1px solid gray",
                margin: "10px",
                padding: "10px",
                cursor: "pointer",
              }}
            >
              <h3>{restaurant.name}</h3>

              <p>{restaurant.description}</p>

              <p>⭐ {restaurant.rating}</p>

              <p>{restaurant.city}</p>
            </div>
          </Link>

        ))
      }

    </div>

  );
}

export default Home;