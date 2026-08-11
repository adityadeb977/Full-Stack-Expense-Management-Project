import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // User not logged in
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Admin-only page
    if (adminOnly && role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;