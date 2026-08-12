import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import API from "../components/services/api";

const Dashboard = () => {
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [stats, setStats] = useState(null);
    const role = localStorage.getItem("role");
    const isManager = role === "manager";

    const handleEditExpense = (expense) => {
        setSelectedExpense(expense);
    };

    const handleClearSelection = () => {
        setSelectedExpense(null);
    };

    const handleRefreshExpenses = () => {
        setRefreshFlag((prev) => !prev);
    };

    const fetchStats = async () => {
        if (!isManager) return;

        try {
            const response = await API.get("/admin/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching manager dashboard stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [refreshFlag, isManager]);

    return (
        <div>
            <NavBar />

            <div className="max-w-7xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6">
                    {isManager ? "Team Expenses" : "My Expenses"}
                </h2>

                {!isManager && (
                    <ExpenseForm
                        selectedExpense={selectedExpense}
                        onUpdated={handleRefreshExpenses}
                        onCancel={handleClearSelection}
                    />
                )}

                {isManager && stats && (
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

                <div className="mt-8">
                    <ExpenseTable
                        admin={false}
                        approver={isManager}
                        refreshFlag={refreshFlag}
                        onEdit={isManager ? undefined : handleEditExpense}
                        onDelete={handleRefreshExpenses}
                        onAction={handleRefreshExpenses}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;