import React, { useState } from "react";
import NavBar from "../components/NavBar";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import ExpenseTable from "../components/ExpenseTable";

const AdminDashboard = () => {
    const [showAddUser, setShowAddUser] = useState(false);
    const [refreshUsersFlag, setRefreshUsersFlag] = useState(0);

    const refreshUsers = () => {
        setRefreshUsersFlag((prev) => prev + 1);
    };

    return (
        <div>
            <NavBar />

            <div className="max-w-7xl mx-auto p-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage users and review expense requests.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddUser(true)}
                        className="rounded-xl bg-[#193680] px-5 py-3 text-white font-semibold hover:bg-[#26479b]"
                    >
                        Add User
                    </button>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Users</h3>
                    </div>

                    {showAddUser && (
                        <div className="mb-6">
                            <UserForm
                                fetchUsers={refreshUsers}
                                onClose={() => setShowAddUser(false)}
                            />
                        </div>
                    )}

                    <UserTable admin={true} refreshFlag={refreshUsersFlag} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mt-10 mb-4 text-[#193680]">
                        All Expenses
                    </h3>
                    <ExpenseTable admin={true} />
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;