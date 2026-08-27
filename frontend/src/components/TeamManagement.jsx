import { useEffect, useMemo, useState } from "react";
import API from "./services/api";

const TeamManagement = ({ refreshFlag = 0, onAction }) => {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [teamName, setTeamName] = useState("");
    const [managerSelection, setManagerSelection] = useState({});
    const [memberSelection, setMemberSelection] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [teamsResponse, usersResponse] = await Promise.all([
                API.get("/admin/teams"),
                API.get("/admin/users"),
            ]);
            setTeams(teamsResponse.data);
            setUsers(usersResponse.data.filter((user) => user.role !== "admin"));
        } catch (fetchError) {
            console.error(fetchError);
            setError(fetchError.response?.data?.detail || "Could not load teams.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 0);

        return () => clearTimeout(timer);
    }, [refreshFlag]);

    const managerCandidates = useMemo(() => users.filter((user) => user.role !== "admin"), [users]);

    const createTeam = async (event) => {
        event.preventDefault();
        if (!teamName.trim()) return;

        setSaving(true);
        setError("");
        try {
            await API.post("/admin/teams", { name: teamName.trim() });
            setTeamName("");
            await fetchData();
            onAction?.();
        } catch (createError) {
            console.error(createError);
            setError(createError.response?.data?.detail || "Could not create team.");
        } finally {
            setSaving(false);
        }
    };

    const assignManager = async (teamId) => {
        const userId = managerSelection[teamId];
        if (!userId) return;
        setError("");
        try {
            await API.put(`/admin/teams/${teamId}/manager`, { user_id: userId });
            await fetchData();
            onAction?.();
        } catch (assignError) {
            console.error(assignError);
            setError(assignError.response?.data?.detail || "Could not assign manager.");
        }
    };

    const assignMember = async (teamId) => {
        const userId = memberSelection[teamId];
        if (!userId) return;
        setError("");
        try {
            await API.put(`/admin/teams/${teamId}/members/${userId}`);
            await fetchData();
            onAction?.();
        } catch (assignError) {
            console.error(assignError);
            setError(assignError.response?.data?.detail || "Could not assign team member.");
        }
    };

    const removeMember = async (teamId, userId) => {
        setError("");
        try {
            await API.delete(`/admin/teams/${teamId}/members/${userId}`);
            await fetchData();
            onAction?.();
        } catch (removeError) {
            console.error(removeError);
            setError(removeError.response?.data?.detail || "Could not remove team member.");
        }
    };

    const removeManager = async (teamId) => {
        setError("");
        try {
            await API.delete(`/admin/teams/${teamId}/manager`);
            await fetchData();
            onAction?.();
        } catch (removeError) {
            console.error(removeError);
            setError(removeError.response?.data?.detail || "Could not remove manager.");
        }
    };

    const deleteTeam = async (teamId) => {
        if (!window.confirm("Delete this team? Members and manager will be unassigned.")) return;
        setError("");
        try {
            await API.delete(`/admin/teams/${teamId}`);
            await fetchData();
            onAction?.();
        } catch (deleteError) {
            console.error(deleteError);
            setError(deleteError.response?.data?.detail || "Could not delete team.");
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Create team</h3>
                        <p className="mt-1 text-sm text-slate-500">Every team has a fixed monthly budget of Rs. 10000.</p>
                    </div>
                    <form onSubmit={createTeam} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={teamName}
                            onChange={(event) => setTeamName(event.target.value)}
                            placeholder="Enter team name"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#193680] focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#193680] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#26479b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Creating..." : "Create team"}
                        </button>
                    </form>
                </div>
                {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Teams</h3>

                {loading ? (
                    <p className="mt-4 text-sm text-slate-500">Loading teams...</p>
                ) : teams.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No teams created yet.</p>
                ) : (
                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {teams.map((team) => (
                            <article key={team.id} className="rounded-xl border border-slate-200 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">{team.name}</h4>
                                        <p className="text-sm text-slate-500">Budget: Rs. {Number(team.budget_amount || 10000).toFixed(2)} ({team.budget_month})</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteTeam(team.id)}
                                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                    >
                                        Delete team
                                    </button>
                                </div>

                                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                    <p className="text-sm font-semibold text-slate-700">Manager</p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {team.manager ? `${team.manager.name} (${team.manager.email})` : "Not assigned"}
                                    </p>
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                        <select
                                            value={managerSelection[team.id] || ""}
                                            onChange={(event) => setManagerSelection({ ...managerSelection, [team.id]: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        >
                                            <option value="">Select manager</option>
                                            {managerCandidates.map((candidate) => (
                                                <option key={candidate.id} value={candidate.id}>{candidate.name} - {candidate.email}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => assignManager(team.id)}
                                            className="rounded-lg bg-[#193680] px-3 py-2 text-sm font-semibold text-white hover:bg-[#26479b]"
                                        >
                                            Assign manager
                                        </button>
                                        {team.manager && (
                                            <button
                                                type="button"
                                                onClick={() => removeManager(team.id)}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                            >
                                                Remove manager
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                    <p className="text-sm font-semibold text-slate-700">Members ({team.members?.length || 0})</p>
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                        <select
                                            value={memberSelection[team.id] || ""}
                                            onChange={(event) => setMemberSelection({ ...memberSelection, [team.id]: event.target.value })}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        >
                                            <option value="">Select employee</option>
                                            {users.filter((user) => user.id !== team.manager_id).map((candidate) => (
                                                <option key={candidate.id} value={candidate.id}>{candidate.name} - {candidate.email}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => assignMember(team.id)}
                                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                        >
                                            Add member
                                        </button>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {(team.members || []).length ? (
                                            team.members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                                                    <p className="text-sm text-slate-700">{member.name} ({member.email})</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(team.id, member.id)}
                                                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">No team members assigned yet.</p>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default TeamManagement;
