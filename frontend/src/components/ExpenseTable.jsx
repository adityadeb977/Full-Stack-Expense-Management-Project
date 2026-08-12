import React, { useEffect, useState } from "react";
import API from "./services/api";

const ExpenseTable = ({ admin = false, approver = false, refreshFlag, onEdit, onDelete, onAction }) => {
    const [expenses, setExpenses] = useState([]);

    const fetchExpenses = async () => {
        try {
            const endpoint = admin || approver
                ? "/admin/expenses"
                : "/expenses";

            const response = await API.get(endpoint);
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [refreshFlag]);

    const approveExpense = async (id) => {
        try {
            await API.put(`/admin/expenses/${id}/approve`);
            fetchExpenses();
            onAction?.();
        } catch (error) {
            console.error(error);
        }
    };

    const rejectExpense = async (id) => {
        try {
            await API.put(`/admin/expenses/${id}/reject`);
            fetchExpenses();
            onAction?.();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const endpoint = admin
                ? `/admin/expenses/${id}`
                : `/expenses/${id}`;

            await API.delete(endpoint);
            fetchExpenses();
            onDelete?.();
            onAction?.();
        } catch (error) {
            console.error(error);
            alert("Failed to delete expense");
        }
    };

    const editExpense = (expense) => {
        onEdit?.(expense);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">

                <thead className="bg-[#193680] text-white">
                    <tr>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Category</th>

                        {(admin || approver) && (
                            <th className="px-4 py-3 text-left">
                                Submitted By
                            </th>
                        )}

                        <th className="px-4 py-3 text-left">Status</th>

                        <th className="px-4 py-3 text-center">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {expenses.length > 0 ? (
                        expenses.map((expense) => (
                            <tr
                                key={expense.id}
                                className="border-b hover:bg-gray-100"
                            >
                                <td className="px-4 py-3">
                                    {expense.title}
                                </td>

                                <td className="px-4 py-3">
                                    ₹{expense.amount}
                                </td>

                                <td className="px-4 py-3">
                                    {expense.category}
                                </td>

                                {(admin || approver) && (
                                    <td className="px-4 py-3">
                                        {expense.user_name}
                                    </td>
                                )}

                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 rounded text-white ${
                                            expense.status === "Approved"
                                                ? "bg-green-600"
                                                : expense.status === "Rejected"
                                                ? "bg-red-600"
                                                : "bg-yellow-500"
                                        }`}
                                    >
                                        {expense.status}
                                    </span>
                                </td>

                                <td className="px-4 py-3 flex gap-2 justify-center">
                                    {admin || approver ? (
                                        <>
                                            {expense.status === "Pending" ? (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            approveExpense(expense.id)
                                                        }
                                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            rejectExpense(expense.id)
                                                        }
                                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-500">
                                                    —
                                                </span>
                                            )}

                                            {admin && (
                                                <button
                                                    onClick={() => deleteExpense(expense.id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        expense.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        editExpense(expense)
                                                    }
                                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteExpense(expense.id)
                                                    }
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">
                                                —
                                            </span>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={admin ? 6 : 5}
                                className="text-center py-4"
                            >
                                No expenses found
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>
        </div>
    );
};

export default ExpenseTable;