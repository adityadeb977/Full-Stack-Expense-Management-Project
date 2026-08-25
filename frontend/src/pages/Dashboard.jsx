import React, { useState } from "react";
import NavBar from "../components/NavBar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import SpendingInsights from "../components/SpendingInsights";

const employeeViews = [
    { id: "home", label: "Home" },
    { id: "add-expense", label: "Add expense" },
    { id: "expenses", label: "My expenses" },
];

const managerViews = [
    { id: "home", label: "Home" },
    { id: "expenses", label: "Team expenses" },
];

const Dashboard = () => {
    const role = localStorage.getItem("role");
    const isManager = role === "manager";
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [activeView, setActiveView] = useState("home");
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
                            {activeView === "home" && (isManager ? "Lead your team with clarity and confidence." : "Track your spending pace and set limits for the month.")}
                            {activeView === "add-expense" && (selectedExpense ? "Update your expense submission." : "Submit a new expense for review.")}
                            {activeView === "expenses" && (isManager ? "Review and process your team's expense submissions." : "Search and review your expense submissions.")}
                        </p>
                    </div>

                    {isManager && activeView === "home" && (
                        <section className="flex min-h-[calc(100vh-220px)] items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-slate-100 px-6 py-16 text-center shadow-sm sm:px-10">
                            <div className="max-w-3xl">
                                <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#193680] text-2xl font-bold text-white shadow-lg shadow-blue-900/20">
                                    EM
                                </div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#193680]">Manager workspace</p>
                                <h3 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">Welcome to your manager workspace</h3>
                                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                                    Keep your team moving forward with a clear view of every expense and decision that matters.
                                </p>
                            </div>
                        </section>
                    )}

                    {!isManager && activeView === "home" && <SpendingInsights />}

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
