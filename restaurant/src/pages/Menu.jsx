import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  UtensilsCrossed,
  IndianRupee,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";

import MenuModal from "../components/MenuModal";
import { getCategories } from "../services/category.service";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/menu.service";

// 1. Add global cache variables outside the component structure
let globalMenuCache = null;
let globalCategoryCache = null;
let hasFetchedMenuBefore = false;

function Menu() {
  // 2. Initialize layout states immediately from global caches if available
  const [menuItems, setMenuItems] = useState(() => globalMenuCache || []);
  const [categories, setCategories] = useState(() => globalCategoryCache || []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    isAvailable: true,
  });

  // Helpers to update states and caches at the same time
  const updateMenuState = (newItems) => {
    globalMenuCache = newItems;
    setMenuItems(newItems);
  };

  const updateCategoryState = (newCategories) => {
    globalCategoryCache = newCategories;
    setCategories(newCategories);
  };

  // ================= Fetch Categories =================

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      updateCategoryState(response?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  };

  // ================= Fetch Menu =================

  const fetchMenu = async () => {
    try {
      const response = await getMenuItems();
      updateMenuState(response?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu");
    }
  };

  // ================= Create / Update =================

  const handleSubmit = async () => {
    try {
      if (
        !formData.name ||
        !formData.price ||
        !formData.categoryId
      ) {
        return toast.error("Please fill all required fields");
      }

      const selectedCategory = categories.find(c => c.id === formData.categoryId);
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingItem) {
        // Optimistic UI Update for fast execution
        const updated = menuItems.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...payload, category: selectedCategory ? { name: selectedCategory.name } : item.category }
            : item
        );
        updateMenuState(updated);

        await updateMenuItem(editingItem.id, payload);
        toast.success("Menu Updated Successfully");
      } else {
        await createMenuItem(payload);
        toast.success("Menu Item Added Successfully");
      }

      setShowModal(false);
      setEditingItem(null);

      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        categoryId: "",
        isAvailable: true,
      });

      fetchMenu(); // Background sync
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
      fetchMenu(); // Revert to database state if failure occurs
    }
  };

  useEffect(() => {
    // 3. Only trigger the underlying network requests if it has not loaded once yet
    if (!hasFetchedMenuBefore) {
      fetchCategories();
      fetchMenu();
      hasFetchedMenuBefore = true;
    }
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmDelete) return;

    try {
      // Optimistic UI Delete Update
      const updated = menuItems.filter((item) => item.id !== id);
      updateMenuState(updated);

      await deleteMenuItem(id);
      toast.success("Menu Item Deleted");
      fetchMenu(); // Background sync
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete menu item");
      fetchMenu(); // Revert to database state if failure occurs
    }
  };

  // ================= Search =================

  const filteredMenu = menuItems.filter((item) =>
    item?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Manage all food items of your restaurant.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: "",
              description: "",
              price: "",
              image: "",
              categoryId: "",
              isAvailable: true,
            });
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg w-full md:w-auto transition-colors"
        >
          <Plus size={20} />
          Add Menu Item
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5 mb-6 md:mb-8">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Menu List */}
      {filteredMenu.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg py-16 md:py-24 text-center px-4">
          <UtensilsCrossed
            size={60}
            className="mx-auto text-gray-300 mb-4 md:mb-5 md:size-[70px]"
          />
          <h2 className="text-xl md:text-2xl font-bold">No Menu Items</h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Start by adding your first menu item.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col overflow-hidden border"
            >
              <img
                src={
                  item.image ||
                  "https://placehold.co/600x400?text=FoodHub"
                }
                alt={item.name}
                className="h-48 md:h-52 w-full object-cover"
              />

              <div className="p-4 md:p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h2 className="text-lg md:text-xl font-bold truncate pr-2">{item.name}</h2>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold ${
                      item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
                  <Tag size={16} />
                  <span className="truncate">{item.category?.name || "--"}</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <IndianRupee
                    size={16}
                    className="text-orange-500"
                  />
                  <span className="text-xl md:text-2xl font-bold text-orange-500">
                    {item.price}
                  </span>
                </div>

                {/* Pushes the buttons to the bottom of the card if descriptions vary in length */}
                <div className="flex gap-3 mt-auto pt-5">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setFormData({
                        name: item.name,
                        description: item.description || "",
                        price: item.price,
                        image: item.image || "",
                        categoryId: item.categoryId,
                        isAvailable: item.isAvailable,
                      });
                      setShowModal(true);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 md:py-2.5 rounded-lg flex justify-center items-center gap-1.5 md:gap-2 text-sm md:text-base transition-colors"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 md:py-2.5 rounded-lg flex justify-center items-center gap-1.5 md:gap-2 text-sm md:text-base transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 md:mt-6 text-gray-500 text-sm md:text-base">
        Showing {filteredMenu.length} Menu Item
        {filteredMenu.length !== 1 ? "s" : ""}
      </div>

      {/* Modal */}
      <MenuModal
        showModal={showModal}
        setShowModal={setShowModal}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        editingItem={editingItem}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

export default Menu;