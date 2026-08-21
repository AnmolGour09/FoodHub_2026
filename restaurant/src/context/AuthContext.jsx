import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("restaurantToken");
    const restaurantData = localStorage.getItem("restaurant");

    if (
      token &&
      restaurantData &&
      restaurantData !== "undefined"
    ) {
      try {
        setRestaurant(JSON.parse(restaurantData));
      } catch (error) {
        console.error("Invalid restaurant data:", error);

        localStorage.removeItem("restaurantToken");
        localStorage.removeItem("restaurant");
      }
    }

    setLoading(false);
  }, []);

  const login = (token, restaurantData) => {
    localStorage.setItem("restaurantToken", token);
    localStorage.setItem(
      "restaurant",
      JSON.stringify(restaurantData)
    );

    setRestaurant(restaurantData);
  };

  const logout = () => {
    localStorage.removeItem("restaurantToken");
    localStorage.removeItem("restaurant");

    setRestaurant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        restaurant,
        loading,
        login,
        logout,
        isAuthenticated: !!restaurant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);