import { useEffect, useState } from "react";
import API from "./services/api";

const ACTIONS = [
    ["", "All actions"],
    ["approve_expense", "Approved expense"],
    ["reject_expense", "Rejected expense"],
    ["delete_expense", "Deleted expense"],
    ["update_user_role", "Changed user role"],
    ["delete_user", "Deleted user"],
    ["approve_registration", "Approved registration"],
    ["reject_registration", "Rejected registration"],
];

const formatDate = (value) => value ? new Date(value).toLocaleString() : "-";
const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const AuditLog = () => {
    const [logs, setLogs] = useState({ items: [], total: 0, page: 1, page_size: 25 });
    const [filters, setFilters] = useState({ action: "", date_from: "", date_to: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
                params.page = logs.page;
                params.page_size = 25;
                const response = await API.get("/admin/audit-logs", { params });
                setLogs(response.data);
            } catch (fetchError) {
                setError(fetchError.response?.data?.detail || "Could not load audit logs.");
            } finally {
                setLoading(false);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [filters, logs.page]);

    const updateFilter = (event) => {
        setLogs((current) => ({ ...current, page: 1 }));
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const downloadCsv = () => {
        const header = ["Date", "Actor", "Action", "Target", "Details"];
        const rows = logs.items.map((log) => [
            formatDate(log.created_at), log.actor_name, log.action, `${log.target_type}:${log.target_id || ""}`,
            Object.entries(log.details || {}).map(([key, value]) => `${key}=${value}`).join("; "),
        ]);
        const blob = new Blob([[header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "expense-management-audit-log.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const pageCount = Math.max(1, Math.ceil(logs.total / logs.page_size));

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Audit log</h3>
                    <p className="mt-1 text-sm text-slate-500">A traceable record of administrative decisions and account changes.</p>
                </div>
                <button type="button" onClick={downloadCsv} disabled={!logs.items.length} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                    Export CSV
                </button>
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
                <label className="text-sm font-semibold text-slate-700">Action
                    <select name="action" value={filters.action} onChange={updateFilter} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#193680]">
                        {ACTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">From
                    <input name="date_from" type="date" value={filters.date_from} onChange={updateFilter} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#193680]" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Before
                    <input name="date_to" type="date" value={filters.date_to} onChange={updateFilter} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#193680]" />
                </label>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading audit logs...</p> : error ? <p className="p-8 text-center text-sm text-red-600">{error}</p> : (
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-[#193680] text-xs uppercase tracking-wide text-white"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Details</th></tr></thead>
                        <tbody>{logs.items.length ? logs.items.map((log) => <tr key={log.id} className="border-t border-slate-100"><td className="px-5 py-4 text-slate-600">{formatDate(log.created_at)}</td><td className="px-5 py-4 font-semibold text-slate-800">{log.actor_name}</td><td className="px-5 py-4 text-slate-700">{ACTIONS.find(([value]) => value === log.action)?.[1] || log.action}</td><td className="px-5 py-4 text-slate-600">{log.target_type} {log.target_id ? `#${log.target_id.slice(-6)}` : ""}</td><td className="max-w-xs px-5 py-4 text-slate-600">{Object.entries(log.details || {}).map(([key, value]) => `${key}: ${value}`).join(" | ") || "-"}</td></tr>) : <tr><td colSpan="5" className="p-8 text-center text-slate-500">No audit events found.</td></tr>}</tbody>
                    </table>
                )}
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500"><span>{logs.total} event{logs.total === 1 ? "" : "s"}</span><div className="flex items-center gap-3"><button type="button" disabled={logs.page <= 1} onClick={() => setLogs((current) => ({ ...current, page: current.page - 1 }))} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40">Previous</button><span>Page {logs.page} of {pageCount}</span><button type="button" disabled={logs.page >= pageCount} onClick={() => setLogs((current) => ({ ...current, page: current.page + 1 }))} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40">Next</button></div></div>
        </section>
    );
};

export default AuditLog;
