import React, { useEffect, useState } from "react";

const CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Others",
];

const STATUSES = ["Pending", "Approved", "Rejected"];

const ExpenseFilters = ({ filters, onApply, onReset, showUserSearch = false }) => {
    const [draft, setDraft] = useState(filters);

    useEffect(() => {
        setDraft(filters);
    }, [filters]);

    const handleChange = (field, value) => {
        setDraft({ ...draft, [field]: value });
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-4">
            <h4 className="text-sm font-semibold text-[#193680] mb-4">
                Search and Filters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {showUserSearch && (
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Search (User)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Rahul"
                            value={draft.search}
                            onChange={(e) => handleChange("search", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm text-gray-600 mb-1">
                        Status
                    </label>
                    <select
                        value={draft.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">
                        Category
                    </label>
                    <select
                        value={draft.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={draft.date_from}
                        onChange={(e) => handleChange("date_from", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={draft.date_to}
                        onChange={(e) => handleChange("date_to", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">
                        Min Amount
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={draft.min_amount}
                        onChange={(e) => handleChange("min_amount", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">
                        Max Amount
                    </label>
                    <input
                        type="number"
                        placeholder="Any"
                        min="0"
                        value={draft.max_amount}
                        onChange={(e) => handleChange("max_amount", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button
                    type="button"
                    onClick={() => onApply(draft)}
                    className="bg-[#193680] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#26479b]"
                >
                    Apply Filters
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default ExpenseFilters;
