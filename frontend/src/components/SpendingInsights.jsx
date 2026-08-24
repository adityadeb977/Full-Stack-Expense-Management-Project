import { useEffect, useState } from "react";
import API from "./services/api";

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Others"];

const currentMonth = () => new Date().toISOString().slice(0, 7);
const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const SpendingInsights = () => {
    const [month, setMonth] = useState(currentMonth);
    const [insights, setInsights] = useState(null);
    const [budget, setBudget] = useState("");
    const [categoryBudgets, setCategoryBudgets] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadInsights = async () => {
        setLoading(true);
        setError("");
        try {
            const [insightsResponse, budgetsResponse] = await Promise.all([
                API.get("/insights", { params: { month } }),
                API.get("/budgets", { params: { month } })
            ]);
            setInsights(insightsResponse.data);
            const budgets = budgetsResponse.data;
            setBudget(budgets.find((item) => !item.category)?.amount?.toString() || "");
            setCategoryBudgets(Object.fromEntries(
                budgets.filter((item) => item.category).map((item) => [item.category, item.amount])
            ));
        } catch (loadError) {
            console.error(loadError);
            setError(loadError.response?.data?.detail || "Could not load spending insights.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, [month]);

    const saveBudget = async (amount, category = null) => {
        if (!amount || Number(amount) <= 0) return;
        await API.put(`/budgets/${month}`, { amount: Number(amount), category });
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            if (budget) await saveBudget(budget);
            await Promise.all(
                Object.entries(categoryBudgets)
                    .filter(([, amount]) => amount && Number(amount) > 0)
                    .map(([category, amount]) => saveBudget(amount, category))
            );
            await loadInsights();
        } catch (saveError) {
            console.error(saveError);
            setError(saveError.response?.data?.detail || "Could not save budgets.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading spending insights...</div>;
    if (error && !insights) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;

    const maxSpent = Math.max(...(insights.categories || []).map((item) => item.spent), 1);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Budget Guardian</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">Understand your spending pace</h3>
                </div>
                <label className="text-sm font-semibold text-slate-700">
                    Month
                    <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#193680] focus:ring-2 focus:ring-blue-100" />
                </label>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    ["Approved spending", money(insights.approved_total), "text-[#193680]"],
                    ["Budget remaining", insights.remaining === null ? "Not set" : money(insights.remaining), insights.remaining !== null && insights.remaining < 0 ? "text-red-600" : "text-emerald-600"],
                    ["Projected month end", money(insights.projected_total), "text-amber-600"],
                    ["Pending review", money(insights.pending_total), "text-slate-700"]
                ].map(([label, value, color]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-slate-900">Category breakdown</h4>
                            <p className="mt-1 text-sm text-slate-500">Approved expenses only</p>
                        </div>
                        <span className="text-sm text-slate-500">{insights.days_elapsed}/{insights.days_in_month} days</span>
                    </div>
                    <div className="mt-5 space-y-4">
                        {insights.categories.length ? insights.categories.map((item) => (
                            <div key={item.name}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <span className="font-semibold text-slate-700">{item.name}</span>
                                    <span className="text-slate-500">{money(item.spent)}{item.budget ? ` / ${money(item.budget)}` : ""}</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-slate-100" role="progressbar" aria-label={`${item.name} spending`} aria-valuenow={item.spent} aria-valuemin="0" aria-valuemax={item.budget || maxSpent}>
                                    <div className={`h-2.5 rounded-full ${item.budget && item.spent > item.budget ? "bg-red-500" : "bg-[#193680]"}`} style={{ width: `${Math.min((item.spent / (item.budget || maxSpent)) * 100, 100)}%` }} />
                                </div>
                            </div>
                        )) : <p className="py-8 text-center text-sm text-slate-500">No approved spending recorded for this month.</p>}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900">Set monthly limits</h4>
                    <p className="mt-1 text-sm text-slate-500">Create an overall limit and optional category limits.</p>
                    <form onSubmit={handleSave} className="mt-4 space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Overall budget<input type="number" min="1" step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="e.g. 25000" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                        {CATEGORIES.map((category) => <label key={category} className="block text-sm font-semibold text-slate-700">{category}<input type="number" min="1" step="0.01" value={categoryBudgets[category] || ""} onChange={(event) => setCategoryBudgets({ ...categoryBudgets, [category]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>)}
                        <button disabled={saving} className="w-full rounded-lg bg-[#193680] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#26479b]">{saving ? "Saving..." : "Save budgets"}</button>
                    </form>
                </section>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="font-bold text-slate-900">Guardian alerts</h4>
                <div className="mt-3 space-y-2">
                    {insights.alerts.length ? insights.alerts.map((alert) => <div key={`${alert.type}-${alert.category || "overall"}`} className={`rounded-lg border px-4 py-3 text-sm ${alert.severity === "high" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}><strong>{alert.severity === "high" ? "Action needed" : "Watch"}:</strong> {alert.message}</div>) : <p className="text-sm text-emerald-700">No budget alerts for this month.</p>}
                </div>
            </section>
        </div>
    );
};

export default SpendingInsights;
