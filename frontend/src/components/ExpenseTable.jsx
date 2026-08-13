import React, { useEffect, useState } from "react";
import API from "./services/api";
import ExpenseFilters from "./ExpenseFilters";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

const defaultFilters = {
    search: "",
    category: "",
    status: "",
    date_from: "",
    date_to: "",
    min_amount: "",
    max_amount: "",
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB");
};

const ExpenseTable = ({ admin = false, approver = false, refreshFlag, onEdit, onDelete, onAction }) => {
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState(defaultFilters);
    const [loading, setLoading] = useState(false);

    const showUserSearch = admin || approver;

    const buildParams = () => {
        const params = { page, page_size: PAGE_SIZE };

        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;
        if (filters.min_amount !== "") params.min_amount = Number(filters.min_amount);
        if (filters.max_amount !== "") params.max_amount = Number(filters.max_amount);

        return params;
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const endpoint = admin || approver ? "/admin/expenses" : "/expenses";
            const response = await API.get(endpoint, { params: buildParams() });
            setExpenses(response.data.items);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [refreshFlag, page, filters]);

    const handleFilterApply = (newFilters) => {
        setPage(1);
        setFilters(newFilters);
    };

    const handleFilterReset = () => {
        setPage(1);
        setFilters(defaultFilters);
    };

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
            const endpoint = admin ? `/admin/expenses/${id}` : `/expenses/${id}`;
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

    const colSpan = (admin || approver) ? 7 : 6;

    return (
        <div>
            <ExpenseFilters
                filters={filters}
                onApply={handleFilterApply}
                onReset={handleFilterReset}
                showUserSearch={showUserSearch}
            />

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-[#193680] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            {(admin || approver) && (
                                <th className="px-4 py-3 text-left">Submitted By</th>
                            )}
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={colSpan} className="text-center py-6 text-gray-500">
                                    Loading expenses...
                                </td>
                            </tr>
                        ) : expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="border-b hover:bg-gray-100">
                                    <td className="px-4 py-3">{expense.title}</td>
                                    <td className="px-4 py-3">₹{expense.amount}</td>
                                    <td className="px-4 py-3">{expense.category}</td>
                                    <td className="px-4 py-3">{formatDate(expense.created_at)}</td>
                                    {(admin || approver) && (
                                        <td className="px-4 py-3">{expense.user_name}</td>
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
                                                            onClick={() => approveExpense(expense.id)}
                                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => rejectExpense(expense.id)}
                                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500">—</span>
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
                                        ) : expense.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() => editExpense(expense)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteExpense(expense.id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={colSpan} className="text-center py-4">
                                    No expenses found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
            />
        </div>
    );
};

export default ExpenseTable;
