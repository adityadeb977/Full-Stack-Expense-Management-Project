import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import API from "../components/services/api";
const Login = () => {

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();

    const onSubmit = async (data) => {

        try {

            const response = await API.post("/login", data);

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            localStorage.setItem(
                "name",
                response.data.name
            );

            if (response.data.role === "admin") {

                navigate("/admin");

            } else {

                navigate("/dashboard");

            }

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Login Failed"
            );

        }

    };
useEffect(() => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {

        if (role === "admin") {
            navigate("/admin");
        } else {
            navigate("/dashboard");
        }

    }

}, []);
    return (

        <div className="flex justify-center items-center min-h-screen">

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-8 rounded-xl shadow-lg w-96"
            >

                <h1 className="text-3xl font-bold text-center mb-6">
                    Login
                </h1>

                <div className="mb-4">

                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="w-full border px-3 py-2 rounded-lg"
                        {...register("email", {
                            required: "Email is required"
                        })}
                    />

                    {errors.email &&
                        <p className="text-red-500">
                            {errors.email.message}
                        </p>
                    }

                </div>

                <div className="mb-4 relative">

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className="w-full border px-3 py-2 rounded-lg pr-12"
                        {...register("password", {
                            required: "Password is required"
                        })}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.33 0-9.8-3.21-11.48-7.5a1.54 1.54 0 0 1 0-1.01A10.94 10.94 0 0 1 6.06 6.06" />
                                <path d="M1 1l22 22" />
                                <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                                <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                                <path d="M10.35 4.93A9.94 9.94 0 0 1 12 5c5.33 0 9.8 3.21 11.48 7.5a1.54 1.54 0 0 1 0 1.01A10.94 10.94 0 0 1 17.94 17.94" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>

                    {errors.password &&
                        <p className="text-red-500">
                            {errors.password.message}
                        </p>
                    }

                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full bg-[#193680] text-white py-2 rounded-lg hover:bg-[#26479b]"
                >
                    {isSubmitting ? "Logging In..." : "Login"}
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>

            </form>

        </div>

    );
};

export default Login;