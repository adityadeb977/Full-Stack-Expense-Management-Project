import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {

    const navigate = useNavigate();

    const name = localStorage.getItem("name");

    const role = localStorage.getItem("role");
    const displayRole = role === "user" ? "Employee" : role?.charAt(0).toUpperCase() + role?.slice(1);

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");

        navigate("/");
    };

    return (
        <nav className="bg-[#193680] text-white shadow-md">

            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-bold">
                        Expense Management System
                    </h1>

                    <p className="text-sm text-blue-100">
                        Welcome, {name}
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {displayRole}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
};

export default NavBar;