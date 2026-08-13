import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "./services/api";

const ExpenseForm = ({ selectedExpense, onUpdated, onCancel }) => {
    const [receiptFile, setReceiptFile] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    useEffect(() => {
        if (selectedExpense) {
            reset({
                title: selectedExpense.title,
                amount: selectedExpense.amount,
                category: selectedExpense.category
            });
        } else {
            reset({ title: "", amount: "", category: "" });
        }
        setReceiptFile(null);
    }, [selectedExpense, reset]);

    const onSubmit = async (data) => {

        try {
            let savedExpense;
            if (selectedExpense) {
                const response = await API.put(`/expenses/${selectedExpense.id}`, data);
                savedExpense = response.data;
                alert("Expense updated successfully");
                onCancel?.();
            } else {
                const response = await API.post("/expenses", data);
                savedExpense = response.data;
                alert("Expense added successfully");
            }

            if (receiptFile) {
                const formData = new FormData();
                formData.append("file", receiptFile);
                await API.post(`/expenses/${savedExpense.id}/receipt`, formData);
            }

            reset({ title: "", amount: "", category: "" });
            setReceiptFile(null);
            onUpdated?.();
        } catch (error) {

            console.error(error);

            alert("Failed to save expense");

        }

    };

    return (

        <div className="bg-white shadow-lg rounded-xl p-6">

            <h2 className="text-2xl font-bold mb-6">
                {selectedExpense ? "Edit Expense" : "Add Expense"}
            </h2>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >

                <input
                    type="text"
                    placeholder="Title"
                    className="w-full border rounded-lg px-4 py-2"
                    {...register("title", {
                        required: "Title is required"
                    })}
                />

                {errors.title && (
                    <p className="text-red-500">
                        {errors.title.message}
                    </p>
                )}

                <input
                    type="number"
                    placeholder="Amount"
                    className="w-full border rounded-lg px-4 py-2"
                    {...register("amount", {
                        required: "Amount is required"
                    })}
                />

                {errors.amount && (
                    <p className="text-red-500">
                        {errors.amount.message}
                    </p>
                )}

                <select
                    className="w-full border rounded-lg px-4 py-2"
                    {...register("category", {
                        required: "Category is required"
                    })}
                >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Others">Others</option>
                </select>

                {errors.category && (
                    <p className="text-red-500">
                        {errors.category.message}
                    </p>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receipt (JPEG, PNG, or PDF; max 10 MB)
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(event) => setReceiptFile(event.target.files?.[0] || null)}
                        className="w-full border rounded-lg px-4 py-2 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Required to approve claims of ₹1,000 or more.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-[#193680] text-white px-6 py-2 rounded-lg hover:bg-blue-900"
                    >
                        {isSubmitting
                            ? selectedExpense
                                ? "Saving..."
                                : "Adding..."
                            : selectedExpense
                            ? "Update Expense"
                            : "Add Expense"}
                    </button>

                    {selectedExpense && (
                        <button
                            type="button"
                            onClick={() => {
                                onCancel?.();
                                reset({ title: "", amount: "", category: "" });
                            }}
                            className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

        </div>

    );

};

export default ExpenseForm;
