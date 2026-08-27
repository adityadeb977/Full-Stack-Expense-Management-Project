import { useEffect, useState } from "react";
import API from "./services/api";

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const RiskRadar = ({ refreshFlag }) => {
    const [teamBudgets, setTeamBudgets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshNumber, setRefreshNumber] = useState(0);

    useEffect(() => {
        const fetchTeamBudgets = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await API.get("/admin/team-budgets");
                setTeamBudgets(response.data);
            } catch (fetchError) {
                console.error(fetchError);
                setError(fetchError.response?.data?.detail || "Could not load team budgets.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeamBudgets();
    }, [refreshFlag, refreshNumber]);

    if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading team budgets...</div>;
    if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Admin control center</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">Team budget overview</h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">Monitor each team's monthly budget and approved spending.</p>
                </div>
                <button type="button" onClick={() => setRefreshNumber((value) => value + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Refresh budgets</button>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h4 className="font-bold text-slate-900">All teams</h4>
                    <p className="mt-1 text-sm text-slate-500">Remaining budget is calculated after approved expenses from each team's manager and members.</p>
                </div>
                {teamBudgets.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Team</th>
                                    <th className="px-5 py-3">Budget month</th>
                                    <th className="px-5 py-3">Budget</th>
                                    <th className="px-5 py-3">Approved spending</th>
                                    <th className="px-5 py-3">Remaining</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamBudgets.map((team) => (
                                    <tr key={team.id} className="border-t border-slate-100">
                                        <td className="px-5 py-4 font-semibold text-slate-800">{team.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{team.budget_month}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">{money(team.budget_amount)}</td>
                                        <td className="px-5 py-4 text-slate-700">{money(team.approved_spending)}</td>
                                        <td className={`px-5 py-4 font-bold ${team.remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>{money(team.remaining)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <div className="p-8 text-center text-sm text-slate-500">No teams have been created yet.</div>}
            </section>
        </div>
    );
};

export default RiskRadar;
