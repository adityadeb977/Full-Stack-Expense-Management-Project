import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-100 px-4 py-8">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
                <h1 className="text-4xl font-bold text-center mb-4">Welcome</h1>
                <p className="text-center text-gray-600 mb-8">
                    Please login or register to manage your expenses.
                </p>

                <div className="grid gap-4">
                    <Link
                        to="/login"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#193680] px-4 py-3 text-white font-semibold transition hover:bg-[#26479b]"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="inline-flex w-full items-center justify-center rounded-xl border border-[#193680] px-4 py-3 text-[#193680] font-semibold transition hover:bg-[#e4e8f6]"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
