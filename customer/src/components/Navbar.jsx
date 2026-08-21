import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, Search, X } from "lucide-react";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Clears the user state immediately
    window.location.reload(); // Optional: Refreshes to reset state
  };

  // Safely parse user to prevent rendering crashes
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="w-full sticky top-0 left-0 z-[100] backdrop-blur-md bg-white/95 border-b border-gray-200 shadow-sm">
      {/* 
        Removed max-w-7xl. 
        w-full and justify-between will push the logo to the far left 
        and the nav to the far right on ANY screen size. 
      */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-16 sm:h-20 flex items-center justify-between">

        {/* ========================================= */}
        {/* LEFT SIDE: Logo                           */}
        {/* ========================================= */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-80 transition-opacity">
          <div className="text-2xl sm:text-3xl md:text-4xl">🍔</div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-orange-500 tracking-tight leading-none">
              FoodHub
            </h1>
            <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-medium">
              Order Delicious Food
            </p>
          </div>
        </Link>

        {/* ========================================= */}
        {/* RIGHT SIDE: Navigation & Buttons          */}
        {/* ========================================= */}
        <div className="flex items-center gap-4 lg:gap-8">

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link
              to="/"
              className={`font-medium transition-colors text-sm lg:text-base ${location.pathname === "/"
                ? "text-orange-500"
                : "text-gray-700 hover:text-orange-500"
                }`}
            >
              Home
            </Link>

            <Link
              to="/orders"
              className={`font-medium transition-colors text-sm lg:text-base ${location.pathname === "/orders"
                ? "text-orange-500"
                : "text-gray-700 hover:text-orange-500"
                }`}
            >
              Orders
            </Link>



            {/* Desktop Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-orange-400 transition-colors"
            >
              <ShoppingCart size={24} className="text-gray-700 w-5 h-5 lg:w-6 lg:h-6" />

            </Link>

            {/* Desktop User / Login */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-orange-500 text-white text-center py-2 rounded-xl font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all">
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Buttons */}
          <div className="md:hidden flex items-center gap-2 sm:gap-3">
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-orange-500 transition-colors">
              <ShoppingCart size={22} className="text-gray-800" />

            </Link>

            <button
              onClick={toggleMobileMenu}
              className="text-gray-800 hover:text-orange-500 transition-colors p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-200"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE DROPDOWN MENU                      */}
      {/* ========================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl flex flex-col z-50">
          <div className="px-5 py-6 flex flex-col gap-6">

            {/* Mobile Search */}
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all"
              />
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-semibold px-4 py-3 rounded-xl transition-colors ${location.pathname === "/" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Home
              </Link>

              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-semibold px-4 py-3 rounded-xl transition-colors ${location.pathname === "/orders" ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Orders
              </Link>
            </nav>

            <div className="h-[1px] w-full bg-gray-100 my-2"></div>

            {/* Mobile User / Login */}
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-orange-50/50 border border-orange-100 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 uppercase font-bold">Welcome Back</p>
                    <p className="text-lg font-bold text-gray-900">{user.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-orange-500 text-white text-center py-4 rounded-xl font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-orange-500 text-white text-center py-4 rounded-xl font-bold">
                Login to your account
              </Link>
            )}

          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;