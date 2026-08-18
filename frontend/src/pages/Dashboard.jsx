import React, { useState } from "react";
import NavBar from "../components/NavBar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";

const employeeViews = [
    { id: "welcome", label: "Welcome" },
    { id: "add-expense", label: "Add expense" },
    { id: "expenses", label: "My expenses" },
];

const managerViews = [
    { id: "welcome", label: "Welcome" },
    { id: "expenses", label: "Team expenses" },
];

const Dashboard = () => {
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [activeView, setActiveView] = useState("welcome");
    const role = localStorage.getItem("role");
    const isManager = role === "manager";
    const views = isManager ? managerViews : employeeViews;
    const activeLabel = views.find((view) => view.id === activeView)?.label;

    const handleEditExpense = (expense) => {
        setSelectedExpense(expense);
        setActiveView("add-expense");
    };

    const handleClearSelection = () => setSelectedExpense(null);
    const handleRefreshExpenses = () => setRefreshFlag((previous) => !previous);

    return (
        <div className="min-h-screen bg-slate-100">
            <NavBar />
            <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
                <aside className="w-full shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:min-h-[calc(100vh-89px)] md:w-64 md:border-b-0 md:border-r md:px-5 md:py-8">
                    <div className="mb-5 px-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">{isManager ? "Manager controls" : "Employee workspace"}</p>
                    </div>
                    <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Dashboard sections">
                        {views.map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                onClick={() => {
                                    setActiveView(view.id);
                                    if (view.id === "add-expense") setSelectedExpense(null);
                                }}
                                className={`min-w-max rounded-lg px-3 py-3 text-left text-sm font-semibold transition md:w-full ${activeView === view.id ? "bg-[#193680] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-[#193680]"}`}
                            >
                                {view.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-7">
                        <p className="text-sm font-semibold text-[#193680]">{isManager ? "Manager dashboard" : "Employee dashboard"}</p>
                        <h2 className="mt-1 text-3xl font-bold text-slate-900">{activeLabel}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {activeView === "welcome" && "Choose a section from the sidebar to get started."}
                            {activeView === "add-expense" && (selectedExpense ? "Update your expense submission." : "Submit a new expense for review.")}
                            {activeView === "expenses" && (isManager ? "Review and process your team's expense submissions." : "Search and review your expense submissions.")}
                        </p>
                    </div>

                    {activeView === "welcome" && (
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                            <div className="max-w-2xl">
                                <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Expense workspace</p>
                                <h3 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Welcome back</h3>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    {isManager
                                        ? "Monitor team activity and review submitted expenses from one place."
                                        : "Record your work expenses and keep track of every submission from one place."}
                                </p>
                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {views.slice(1).map((view) => (
                                        <button
                                            key={view.id}
                                            type="button"
                                            onClick={() => setActiveView(view.id)}
                                            className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-[#193680] hover:bg-blue-50 hover:text-[#193680]"
                                        >
                                            Open {view.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {activeView === "add-expense" && !isManager && (
                        <div className="max-w-3xl">
                            <ExpenseForm
                                selectedExpense={selectedExpense}
                                onUpdated={handleRefreshExpenses}
                                onCancel={handleClearSelection}
                            />
                        </div>
                    )}

                    {activeView === "expenses" && (
                        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <ExpenseTable
                                admin={false}
                                approver={isManager}
                                refreshFlag={refreshFlag}
                                onEdit={isManager ? undefined : handleEditExpense}
                                onDelete={handleRefreshExpenses}
                                onAction={handleRefreshExpenses}
                            />
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
