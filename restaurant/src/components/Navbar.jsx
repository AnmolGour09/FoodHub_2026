import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { restaurant, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // The same links from your Sidebar
  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Categories", path: "/categories" },
    { name: "Menu", path: "/menu" },
    { name: "Orders", path: "/orders" },
    { name: "Restaurant", path: "/restaurant" },
  ];

  return (
    // Added 'relative' to the header so the absolute dropdown positions correctly beneath it
    <header className="relative bg-white shadow-sm px-4 md:px-6 py-4 flex justify-between items-center w-full">
      
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button (Hidden on md and up) */}
        <button
          className="md:hidden p-1 text-gray-600 hover:text-orange-500 focus:outline-none transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
        </button>

        {/* Hidden on mobile screens, visible on md (tablet/desktop) and up */}
        <h2 className="hidden md:block text-xl font-semibold">
          Restaurant Panel
        </h2>
      </div>

      <div className="flex items-center gap-4 font-bold">
        {/* Hidden on mobile screens, visible on md and up */}
        <span className=" md:inline">
          {restaurant?.name || "Restaurant"}
        </span>

        <button
          onClick={logout}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Mobile Dropdown Menu Panel */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t md:hidden z-50">
          <nav className="flex flex-col p-4 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)} // Auto-close menu when a link is clicked
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;