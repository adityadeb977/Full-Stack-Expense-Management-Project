import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import API from "../components/services/api";
import { useEffect } from "react";
const Login = () => {

    const navigate = useNavigate();

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

                <div className="mb-4">

                    <input
                        type="password"
                        placeholder="Enter Password"
                        className="w-full border px-3 py-2 rounded-lg"
                        {...register("password", {
                            required: "Password is required"
                        })}
                    />

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

            </form>

        </div>

    );
};

export default Login;