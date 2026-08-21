import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post(
                "/auth/restaurant/login",
                formData
            );
            // Because your backend returns:
            // {
            //   statusCode,
            //   message,
            //   success,
            //   data: {
            //     token,
            //     user
            //   }
            // }

            const result = response.data.data;

            login(result.token, result.restaurant);
            toast.success("Login Successful");

            navigate("/dashboard");
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message || "Login Failed"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-[400px]">
                <h1 className="text-3xl font-bold text-center mb-2">
                    FoodHub
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    Restaurant Partner Login
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-2 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;