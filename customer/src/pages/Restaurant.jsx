import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantById } from "../services/restaurant.service";
import { addToCart } from "../services/cart.service";

function Restaurant() {

  const handleAddToCart = async (menuItemId) => {
    try {
      const response = await addToCart(menuItemId);

      console.log(response);

      alert("Item added to cart successfully!");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message || "Failed to add item to cart"
      );
    }
  };

  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRestaurant = async () => {

      try {

        const response = await getRestaurantById(id);

        console.log(response);

        setRestaurant(response.data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchRestaurant();

  }, [id]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!restaurant) {
    return <h2>Restaurant Not Found</h2>;
  }

  return (
    <div>

      <h1>{restaurant.name}</h1>

      <p>{restaurant.description}</p>

      <p>⭐ {restaurant.rating}</p>

      <p>{restaurant.city}</p>

      <hr />

      <h2>Menu</h2>

      {
        restaurant.menuItems.length === 0 ? (
          <p>No menu items available.</p>
        ) : (
          restaurant.menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid gray",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h3>{item.name}</h3>

              <p>{item.description}</p>

              <p>₹ {item.price}</p>

              <button
                onClick={() => handleAddToCart(item.id)}
              >
                Add to Cart
              </button>
            </div>
          ))
        )
      }

    </div>
  );
}

export default Restaurant;