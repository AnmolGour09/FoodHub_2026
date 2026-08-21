import { X } from "lucide-react";

function RestaurantModal({
  showModal,
  setShowModal,
  formData,
  setFormData,
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
    // Backdrop: Added overflow-y-auto to handle cases where modal is taller than screen
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Container: Set height constraints and flex column for sticky header/footer */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 sm:p-6 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold">Edit Restaurant</h2>
          <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Body: Added overflow-y-auto to make the form scrollable independently of the header */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Input name="name" placeholder="Restaurant Name" value={formData.name} onChange={handleChange} />
            <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
            <Input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
            <Input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
            <Input name="openingTime" type="time" label="Opening" value={formData.openingTime} onChange={handleChange} />
            <Input name="closingTime" type="time" label="Closing" value={formData.closingTime} onChange={handleChange} />
            <Input name="deliveryFee" type="number" placeholder="Delivery Fee" value={formData.deliveryFee} onChange={handleChange} />
            <Input name="minimumOrder" type="number" placeholder="Minimum Order" value={formData.minimumOrder} onChange={handleChange} />

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                rows={3}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                rows={2}
              />
            </div>

            <label className="flex items-center gap-3 sm:col-span-2 p-2">
              <input
                type="checkbox"
                name="isOpen"
                checked={formData.isOpen}
                onChange={handleChange}
                className="w-5 h-5 accent-orange-500"
              />
              <span className="font-semibold text-gray-700">Restaurant is currently open</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white">
          <button
            onClick={() => setShowModal(false)}
            className="w-full sm:w-auto px-6 py-2.5 border rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component to keep code clean
function Input({ name, placeholder, type = "text", value, onChange, label }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
      />
    </div>
  );
}

export default RestaurantModal;