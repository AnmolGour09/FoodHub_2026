import { useEffect, useState } from "react";
import { Plus, Search, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";
import CategoryModal from "../components/CategoryModal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service";

let globalCategoryCache = null;
let hasFetchedCategoriesBefore = false;

function Categories() {
  const [categories, setCategories] = useState(() => globalCategoryCache || []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const updateCategoryState = (newCategories) => {
    globalCategoryCache = newCategories;
    setCategories(newCategories);
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      updateCategoryState(response?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    if (!hasFetchedCategoriesBefore) {
      fetchCategories();
      hasFetchedCategoriesBefore = true;
    }
  }, []);

  const handleSubmit = async () => {
    try {
      if (!categoryName.trim()) {
        return toast.error("Category name is required");
      }

      if (editingCategory) {
        const updated = categories.map((c) =>
          c.id === editingCategory.id ? { ...c, name: categoryName } : c
        );
        updateCategoryState(updated);

        await updateCategory(editingCategory.id, { name: categoryName });
        toast.success("Category updated successfully");
      } else {
        await createCategory({ name: categoryName });
        toast.success("Category created successfully");
      }

      setShowModal(false);
      setCategoryName("");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
      fetchCategories();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this category?");
    if (!confirmed) return;

    try {
      const updated = categories.filter((c) => c.id !== id);
      updateCategoryState(updated);

      await deleteCategory(id);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete category");
      fetchCategories();
    }
  };

  const filteredCategories = categories.filter((category) =>
    category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Manage your restaurant categories.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryName("");
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg w-full md:w-auto transition-colors"
        >
          <Plus size={20} />
          Add Category
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
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* --- MOBILE VIEW: Distinct Card Layout with gaps --- */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border">
            <FolderOpen size={60} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold">No Categories Found</h2>
            <p className="text-gray-500 mt-2 text-sm">Create your first category.</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-xl shadow-sm border p-4 hover:border-orange-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "--"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 border-t border-gray-100 pt-3 mt-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setCategoryName(category.name);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- DESKTOP VIEW: Table Layout --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg w-full overflow-hidden">
        <table className="w-full">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="text-left px-6 py-4">Category Name</th>
              <th className="text-center px-6 py-4">Created</th>
              <th className="text-center px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-16 text-center">
                  <FolderOpen size={70} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-2xl font-bold">No Categories Found</h2>
                  <p className="text-gray-500 mt-2">Create your first category.</p>
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-orange-50 transition">
                  <td className="px-6 py-5 font-semibold text-gray-800">
                    {category.name}
                  </td>
                  <td className="text-center text-gray-500 px-6">
                    {category.createdAt 
                      ? new Date(category.createdAt).toLocaleDateString() 
                      : "--"}
                  </td>
                  <td className="text-center px-6">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryName(category.name);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-4 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 md:mt-5 text-gray-500 text-sm md:text-base">
        Showing {filteredCategories.length} Categories
      </div>

      <CategoryModal
        showModal={showModal}
        setShowModal={setShowModal}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        editingCategory={editingCategory}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

export default Categories;