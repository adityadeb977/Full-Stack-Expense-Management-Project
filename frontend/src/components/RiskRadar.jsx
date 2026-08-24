import { useEffect, useState } from "react";
import API from "./services/api";

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const levelStyles = {
    High: "border-red-200 bg-red-50 text-red-800",
    Medium: "border-amber-200 bg-amber-50 text-amber-800",
    Low: "border-slate-200 bg-slate-50 text-slate-700",
};

const RiskRadar = ({ refreshFlag }) => {
    const [radar, setRadar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [scanNumber, setScanNumber] = useState(0);

    useEffect(() => {
        const fetchRadar = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await API.get("/admin/risk-radar");
                setRadar(response.data);
            } catch (fetchError) {
                console.error(fetchError);
                setError(fetchError.response?.data?.detail || "Could not load risk radar.");
            } finally {
                setLoading(false);
            }
        };

        fetchRadar();
    }, [refreshFlag, scanNumber]);

    if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Scanning expense activity...</div>;
    if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;

    const { summary, items } = radar;
    const cards = [
        ["Flagged claims", summary.flagged_expenses, "text-[#193680]"],
        ["High risk", summary.high_risk, "text-red-600"],
        ["Medium risk", summary.medium_risk, "text-amber-600"],
        ["Claims scanned", summary.scanned_expenses, "text-slate-700"],
    ];

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#193680]">Admin control center</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">Expense Risk Radar</h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">Prioritize claims that may need investigation before they move through approval.</p>
                </div>
                <button type="button" onClick={() => setScanNumber((value) => value + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Refresh scan</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(([label, value, color]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h4 className="font-bold text-slate-900">Claims needing attention</h4>
                    <p className="mt-1 text-sm text-slate-500">Rules are explainable: missing receipts, approval delays, large amounts, and repeated claim details.</p>
                </div>
                {items.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Risk</th>
                                    <th className="px-5 py-3">Claim</th>
                                    <th className="px-5 py-3">Submitted by</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Why it was flagged</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-t border-slate-100 align-top">
                                        <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${levelStyles[item.risk_level]}`}>{item.risk_level} · {item.risk_score}</span></td>
                                        <td className="px-5 py-4"><p className="font-semibold text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.category} · {item.status}</p></td>
                                        <td className="px-5 py-4 text-slate-700">{item.user_name}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">{money(item.amount)}</td>
                                        <td className="px-5 py-4"><ul className="space-y-1 text-slate-600">{item.risk_flags.map((flag) => <li key={flag.code}>• {flag.label} <span className="text-xs text-slate-400">(+{flag.points})</span></li>)}</ul></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <div className="p-8 text-center text-sm text-emerald-700">No claims currently match the radar rules.</div>}
            </section>
        </div>
    );
};

export default RiskRadar;
