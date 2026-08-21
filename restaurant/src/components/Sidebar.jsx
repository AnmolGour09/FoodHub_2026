import { NavLink } from "react-router-dom";

function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Categories", path: "/categories" },
    { name: "Menu", path: "/menu" },
    { name: "Orders", path: "/orders" },
    { name: "Restaurant", path: "/restaurant" },
  ];

  return (
    <div className="hidden md:block w-64 bg-white shadow-md h-full min-h-screen">
      {/* 'hidden md:block' applied above to hide on mobile and show on desktop */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-orange-500">
          FoodHub
        </h1>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-100"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;