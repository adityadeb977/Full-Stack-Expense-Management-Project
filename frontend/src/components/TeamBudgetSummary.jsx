import { useEffect, useState } from "react";
import API from "./services/api";

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const TeamBudgetSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const response = await API.get("/team");
                setSummary(response.data);
            } catch (loadError) {
                console.error(loadError);
                setError(loadError.response?.data?.detail || "Could not load your team budget.");
            } finally {
                setLoading(false);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading team budget...</div>;
    }

    if (error) {
        return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
    }

    if (!summary?.assigned) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Your team</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Not assigned to a team</h3>
                <p className="mt-2 text-sm text-slate-500">Your team budget will appear here once an administrator assigns you to a team.</p>
            </section>
        );
    }

    const remainingClass = summary.remaining < 0 ? "text-red-600" : "text-emerald-600";

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Your team</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">{summary.team.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Team budget for {summary.budget_month}</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-sm text-slate-500">Budget remaining</p>
                    <p className={`mt-1 text-3xl font-bold ${remainingClass}`}>{money(summary.remaining)}</p>
                </div>
            </div>
            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-slate-500">Team budget</p>
                    <p className="mt-1 font-semibold text-slate-800">{money(summary.budget_amount)}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Approved team spending</p>
                    <p className="mt-1 font-semibold text-slate-800">{money(summary.approved_spending)}</p>
                </div>
            </div>
        </section>
    );
};

export default TeamBudgetSummary;
