import { X } from "lucide-react";

function CategoryModal({
  showModal,
  setShowModal,
  categoryName,
  setCategoryName,
  editingCategory,
  handleSubmit,
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-center border-b p-6">
          <h2 className="text-2xl font-bold">
            {editingCategory ? "Edit Category" : "Add Category"}
          </h2>

          <button onClick={() => setShowModal(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <input
            type="text"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">
          <button
            onClick={() => setShowModal(false)}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            {editingCategory ? "Update" : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CategoryModal;