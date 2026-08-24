import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import UserTable from "../components/UserTable";
import UserForm from "../components/UserForm";
import ExpenseTable from "../components/ExpenseTable";
import API from "../components/services/api";
import RiskRadar from "../components/RiskRadar";

const views = [
    { id: "welcome", label: "Welcome" },
    { id: "statistics", label: "Statistics" },
    { id: "risk-radar", label: "Risk Radar" },
    { id: "employees", label: "Employees" },
    { id: "expenses", label: "Expenses" },
];

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState("welcome");
    const [showAddUser, setShowAddUser] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(0);
    const [stats, setStats] = useState(null);
    const [employeeSearch, setEmployeeSearch] = useState("");

    const refreshData = () => setRefreshFlag((previous) => previous + 1);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await API.get("/admin/stats");
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchStats();
    }, [refreshFlag]);

    useEffect(() => {
        if (!showAddUser) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setShowAddUser(false);
        };

        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [showAddUser]);

    const formatAmount = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;
    const activeLabel = views.find((view) => view.id === activeView)?.label;
    const statCards = stats ? [
        ["Total employees", stats.total_users, "text-[#193680]"],
        ["Total managers", stats.total_managers, "text-[#193680]"],
        ["Total expenses", stats.total_expenses, "text-[#193680]"],
        ["Total amount", formatAmount(stats.total_amount), "text-[#193680]"],
        ["Pending amount", formatAmount(stats.pending_amount), "text-amber-600"],
        ["Approved amount", formatAmount(stats.approved_amount), "text-emerald-600"],
        ["Rejected amount", formatAmount(stats.rejected_amount), "text-red-600"],
    ] : [];

    return (
        <div className="min-h-screen bg-slate-100">
            <NavBar />
            <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
                <aside className="w-full shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:min-h-[calc(100vh-89px)] md:w-64 md:border-b-0 md:border-r md:px-5 md:py-8">
                    <div className="mb-5 px-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
                        <p className="mt-1 text-lg font-bold text-slate-800">Admin controls</p>
                    </div>
                    <nav className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Admin sections">
                        {views.map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                onClick={() => setActiveView(view.id)}
                                className={`min-w-max rounded-lg px-3 py-3 text-left text-sm font-semibold transition md:w-full ${activeView === view.id ? "bg-[#193680] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-[#193680]"}`}
                            >
                                {view.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#193680]">Admin dashboard</p>
                            <h2 className="mt-1 text-3xl font-bold text-slate-900">{activeLabel}</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {activeView === "welcome" && "Choose a section from the sidebar to get started."}
                                {activeView === "statistics" && "A quick overview of your expense workspace."}
                                {activeView === "risk-radar" && "Find claims that may need investigation before approval."}
                                {activeView === "employees" && "Search and manage employees and managers."}
                                {activeView === "expenses" && "Review, filter, and process submitted expenses."}
                            </p>
                        </div>
                        {activeView === "employees" && (
                            <button
                                type="button"
                                onClick={() => setShowAddUser((current) => !current)}
                                className="rounded-lg bg-[#193680] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#26479b]"
                            >
                                Add employee
                            </button>
                        )}
                    </div>

                    {activeView === "welcome" && (
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                            <div className="max-w-2xl">
                                <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Admin workspace</p>
                                <h3 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Welcome back</h3>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Manage your team, review expense submissions, and monitor workspace performance from one place.
                                </p>
                                <div className="mt-8 grid gap-3 sm:grid-cols-3">
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

                    {activeView === "statistics" && (
                        stats ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {statCards.map(([label, value, color]) => (
                                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm text-slate-500">{label}</p>
                                        <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading statistics...</div>
                        )
                    )}

                    {activeView === "risk-radar" && <RiskRadar refreshFlag={refreshFlag} />}

                    {activeView === "employees" && (
                        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-4 max-w-md">
                                <label htmlFor="employee-search" className="mb-1.5 block text-sm font-semibold text-slate-700">Search employees</label>
                                <input
                                    id="employee-search"
                                    type="search"
                                    value={employeeSearch}
                                    onChange={(event) => setEmployeeSearch(event.target.value)}
                                    placeholder="Search by name or email"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#193680] focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <UserTable admin={true} refreshFlag={refreshFlag} onAction={refreshData} search={employeeSearch} />
                        </section>
                    )}

                    {activeView === "expenses" && (
                        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                            <ExpenseTable admin={true} refreshFlag={refreshFlag} onDelete={refreshData} onAction={refreshData} />
                        </section>
                    )}
                </main>
            </div>

            {showAddUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setShowAddUser(false);
                    }}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-employee-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <UserForm
                            fetchUsers={refreshData}
                            onClose={() => setShowAddUser(false)}
                            titleId="add-employee-title"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
