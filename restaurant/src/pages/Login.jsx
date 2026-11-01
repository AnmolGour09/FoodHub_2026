// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Link } from "react-router-dom";
// import API from "../api/axios";
// import { useAuth } from "../context/AuthContext";

// function Login() {
//     const navigate = useNavigate();
//     const { login } = useAuth();

//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//     });

//     const handleChange = (e) => {
//         setFormData((prev) => ({
//             ...prev,
//             [e.target.name]: e.target.value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await API.post(
//                 "/auth/restaurant/login",
//                 formData
//             );
//             // Because your backend returns:
//             // {
//             //   statusCode,
//             //   message,
//             //   success,
//             //   data: {
//             //     token,
//             //     user
//             //   }
//             // }

//             const result = response.data.data;

//             login(result.token, result.restaurant);
//             toast.success("Login Successful");

//             navigate("/dashboard");
//         } catch (error) {
//             console.error(error);

//             toast.error(
//                 error.response?.data?.message || "Login Failed"
//             );
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <div className="bg-white shadow-lg rounded-xl p-8 w-[400px]">
//                 <h1 className="text-3xl font-bold text-center mb-2">
//                     FoodHub
//                 </h1>

//                 <p className="text-center text-gray-500 mb-8">
//                     Restaurant Partner Login
//                 </p>

//                 <form onSubmit={handleSubmit} className="space-y-5">
//                     <div>
//                         <label className="block mb-2 font-medium">
//                             Email
//                         </label>

//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Enter email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block mb-2 font-medium">
//                             Password
//                         </label>

//                         <input
//                             type="password"
//                             name="password"
//                             placeholder="Enter password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
//                             required
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
//                     >
//                         Login
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default Login;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await API.post(
                "/auth/restaurant/login",
                formData
            );

            const result = response.data?.data;

            if (!result?.token) {
                throw new Error(
                    "Login response did not contain an authentication token."
                );
            }

            login(result.token, result.restaurant ?? result.user);

            toast.success("Login successful!");

            navigate("/dashboard");
        } catch (error) {
            console.error("Restaurant login error:", error);

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-orange-500">
                        FoodHub
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Restaurant Partner Portal
                    </p>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                    Welcome Back!
                </h2>

                <p className="text-center text-gray-500 mt-2 mb-8">
                    Login to manage your restaurant
                </p>

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition shadow-md"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Registration Link */}
                <div className="mt-7 border-t border-gray-100 pt-6 text-center">
                    <p className="text-gray-600">
                        Don't have a restaurant account?
                    </p>

                    <Link
                        to="/register"
                        className="inline-block mt-2 font-semibold text-orange-600 hover:text-orange-700 transition"
                    >
                        Register Your Restaurant
                    </Link>
                </div>

                <p className="text-xs text-center text-gray-400 mt-6">
                    FoodHub Restaurant Partner Portal
                </p>
            </div>
        </div>
    );
}

export default Login;
