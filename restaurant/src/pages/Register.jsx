
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import API from "../api/axios";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        restaurantName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        const {
            confirmPassword,
            ...registrationData
        } = formData;

        try {
            setLoading(true);

            // Confirm the field names and endpoint match
            // your backend registration controller.
            await API.post(
                "/auth/restaurant/register",
                registrationData
            );

            toast.success(
                "Registration successful! Please log in."
            );

            navigate("/login");
        } catch (error) {
            console.error(
                "Restaurant registration failed:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-orange-500 px-8 py-7 text-center text-white">
                    <h1 className="text-3xl font-bold">
                        FoodHub
                    </h1>

                    <p className="mt-2 text-orange-50">
                        Become a FoodHub Restaurant Partner
                    </p>
                </div>

                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Create Your Restaurant Account
                    </h2>

                    <p className="text-gray-500 mt-2 mb-7">
                        Register your restaurant and get started
                        with FoodHub.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Restaurant and owner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    Restaurant Name
                                </label>

                                <input
                                    type="text"
                                    name="restaurantName"
                                    placeholder="e.g. Spice Garden"
                                    value={formData.restaurantName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    autoComplete="organization"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    Owner Name
                                </label>

                                <input
                                    type="text"
                                    name="ownerName"
                                    placeholder="Enter owner name"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email and phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="restaurant@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    autoComplete="tel"
                                    required
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">
                                Restaurant Address
                            </label>

                            <textarea
                                name="address"
                                placeholder="Enter complete restaurant address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-y focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                autoComplete="street-address"
                                required
                            />
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Minimum 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Re-enter password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold transition shadow-md"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Register Restaurant"}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 mt-6">
                        Already have a restaurant account?{" "}
                        <Link
                            to="/login"
                            className="text-orange-600 font-semibold hover:text-orange-700"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
