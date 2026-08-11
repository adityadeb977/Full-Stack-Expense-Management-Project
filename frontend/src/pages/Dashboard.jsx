import React, { useState } from "react";
import NavBar from "../components/NavBar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";

const Dashboard = () => {
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const handleEditExpense = (expense) => {
        setSelectedExpense(expense);
    };

    const handleClearSelection = () => {
        setSelectedExpense(null);
    };

    const handleRefreshExpenses = () => {
        setRefreshFlag((prev) => !prev);
    };

    return (
        <div>
            <NavBar />

            <div className="max-w-7xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6">My Expenses</h2>

                <ExpenseForm
                    selectedExpense={selectedExpense}
                    onUpdated={handleRefreshExpenses}
                    onCancel={handleClearSelection}
                />

                <div className="mt-8">
                    <ExpenseTable
                        refreshFlag={refreshFlag}
                        onEdit={handleEditExpense}
                        onDelete={handleRefreshExpenses}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;