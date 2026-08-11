import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import API from "../components/services/api";

const Register = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();

    const onSubmit = async (data) => {
        try {
            await API.post("/register", data);
            alert("Registration successful. Please login.");
            navigate("/");
        } catch (error) {
            alert(
                error.response?.data?.detail ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-8 rounded-xl shadow-lg w-96"
            >
                <h1 className="text-3xl font-bold text-center mb-6">
                    Register
                </h1>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Enter Name"
                        className="w-full border px-3 py-2 rounded-lg"
                        {...register("name", {
                            required: "Name is required"
                        })}
                    />
                    {errors.name && (
                        <p className="text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="w-full border px-3 py-2 rounded-lg"
                        {...register("email", {
                            required: "Email is required"
                        })}
                    />
                    {errors.email && (
                        <p className="text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="w-full border px-3 py-2 rounded-lg"
                        {...register("password", {
                            required: "Password is required"
                        })}
                    />
                    {errors.password && (
                        <p className="text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full bg-[#193680] text-white py-2 rounded-lg hover:bg-[#26479b]"
                >
                    {isSubmitting ? "Registering..." : "Register"}
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
