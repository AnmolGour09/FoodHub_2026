import { X } from "lucide-react";

function MenuModal({
    showModal,
    setShowModal,
    formData,
    setFormData,
    categories,
    editingItem,
    handleSubmit,
}) {
    if (!showModal) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl">

                {/* Header */}

                <div className="flex justify-between items-center border-b p-6">

                    <h2 className="text-2xl font-bold">
                        {editingItem ? "Edit Menu Item" : "Add Menu Item"}
                    </h2>

                    <button onClick={() => setShowModal(false)}>
                        <X size={24} />
                    </button>

                </div>

                {/* Body */}

                <div className="p-6 space-y-5">

                    <input
                        type="text"
                        name="name"
                        placeholder="Food Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3"
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3"
                    />

                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3"
                    />

                    <input
                        type="text"
                        name="image"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3"
                    />

                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-3"
                    >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <label className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                        />

                        Available

                    </label>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t p-6">

                    <button
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2 rounded-lg border"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                    >
                        {editingItem ? "Update" : "Save"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default MenuModal;