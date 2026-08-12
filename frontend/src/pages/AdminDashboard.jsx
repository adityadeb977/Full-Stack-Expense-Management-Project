import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import ExpenseTable from "../components/ExpenseTable";
import API from "../components/services/api";

const AdminDashboard = () => {
    const [showAddUser, setShowAddUser] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(0);
    const [stats, setStats] = useState(null);

    const refreshData = () => {
        setRefreshFlag((prev) => prev + 1);
    };

    const fetchStats = async () => {
        try {
            const response = await API.get("/admin/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [refreshFlag]);

    return (
        <div>
            <NavBar />

            <div className="max-w-7xl mx-auto p-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage employees and review expense requests.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddUser(true)}
                        className="rounded-xl bg-[#193680] px-5 py-3 text-white font-semibold hover:bg-[#26479b]"
                    >
                        Add Employee
                    </button>
                </div>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Total Employees</p>
                            <p className="mt-3 text-3xl font-semibold text-[#193680]">{stats.total_users}</p>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Total Managers</p>
                            <p className="mt-3 text-3xl font-semibold text-[#193680]">{stats.total_managers}</p>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Total Expenses</p>
                            <p className="mt-3 text-3xl font-semibold text-[#193680]">{stats.total_expenses}</p>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="mt-3 text-3xl font-semibold text-[#193680]">₹{stats.total_amount.toFixed(2)}</p>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Pending Amount</p>
                            <p className="mt-3 text-3xl font-semibold text-[#d97706]">₹{stats.pending_amount.toFixed(2)}</p>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Approved Amount</p>
                            <p className="mt-3 text-3xl font-semibold text-[#16a34a]">₹{stats.approved_amount.toFixed(2)}</p>
                        </div>
                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">Rejected Amount</p>
                            <p className="mt-3 text-3xl font-semibold text-[#dc2626]">₹{stats.rejected_amount.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Employees</h3>
                    </div>

                    {showAddUser && (
                        <div className="mb-6">
                            <UserForm
                                fetchUsers={refreshData}
                                onClose={() => setShowAddUser(false)}
                            />
                        </div>
                    )}

                    <UserTable admin={true} refreshFlag={refreshFlag} onAction={refreshData} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mt-10 mb-4 text-[#193680]">
                        All Expenses
                    </h3>
                    <ExpenseTable admin={true} refreshFlag={refreshFlag} onDelete={refreshData} onAction={refreshData} />
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;