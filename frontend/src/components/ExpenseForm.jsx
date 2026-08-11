import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import API from "./services/api";

const ExpenseForm = ({ selectedExpense, onUpdated, onCancel }) => {

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
    }, [selectedExpense, reset]);

    const onSubmit = async (data) => {

        try {
            if (selectedExpense) {
                await API.put(`/expenses/${selectedExpense.id}`, data);
                alert("Expense updated successfully");
                onCancel?.();
            } else {
                await API.post("/expenses", data);
                alert("Expense added successfully");
            }

            reset({ title: "", amount: "", category: "" });
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