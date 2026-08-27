import { useCallback, useEffect, useState } from "react";
import API from "./services/api";

const UserTable = ({ admin = false, refreshFlag = 0, onAction, search = "" }) => {

    const [users, setUsers] = useState([]);
    const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = useCallback(async () => {

        try {

            const endpoint = admin
                ? "/admin/users"
                : "/users";

            const response = await API.get(endpoint);

            setUsers(response.data);

        } catch (error) {

            console.error("Error fetching users", error);

        }

    }, [admin]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 0);

        return () => clearTimeout(timer);

    }, [refreshFlag, fetchUsers]);

    useEffect(() => {
        if (!pendingDeleteUser) return undefined;

        const closeOnEscape = (event) => {
            if (event.key === "Escape" && !isDeleting) setPendingDeleteUser(null);
        };

        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [pendingDeleteUser, isDeleting]);

    const confirmDelete = async () => {
        if (!pendingDeleteUser) return;

        setIsDeleting(true);
        try {
            await API.delete(`/admin/users/${pendingDeleteUser.id}`);
            fetchUsers();
            onAction?.();
            setPendingDeleteUser(null);
        } catch (error) {
            console.error("Error deleting employee", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return `${user.name} ${user.email} ${user.role} ${user.team_name || ""}`.toLowerCase().includes(query);
    });

    return (
        <>
        <div className="overflow-x-auto mt-3">

            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">

                <thead className="bg-[#193680] text-white">

                    <tr>

                        <th className="px-4 py-3 text-left">
                            Name
                        </th>

                        <th className="px-4 py-3 text-left">
                            Email
                        </th>

                        {admin && (
                            <>
                                <th className="px-4 py-3 text-left">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Team
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Actions
                                </th>
                            </>
                        )}

                    </tr>

                </thead>

                <tbody>

                    {filteredUsers.length > 0 ? (

                        filteredUsers.map((user) => (

                            <tr
                                key={user.id}
                                className="border-b hover:bg-gray-100 transition"
                            >

                                <td className="px-4 py-3">
                                    {user.name}
                                </td>

                                <td className="px-4 py-3">
                                    {user.email}
                                </td>

                                {admin && (
                                    <>
                                        <td className="px-4 py-3">
                                            {user.role === "user"
                                                ? "Employee"
                                                : user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.team_name || "Unassigned"}
                                        </td>
                                        <td className="px-4 py-3 flex flex-wrap gap-2">
                                            {!user.role || user.role !== "admin" ? (
                                                <>
                                                    {user.role === "user" && (
                                                        <button
                                                            className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                                            onClick={async () => {
                                                                try {
                                                                    await API.patch(`/admin/users/${user.id}/role`, { role: "manager" });
                                                                    fetchUsers();
                                                                    onAction?.();
                                                                } catch (error) {
                                                                    console.error("Error promoting employee", error);
                                                                }
                                                            }}
                                                        >
                                                            Promote
                                                        </button>
                                                    )}
                                                    {user.role === "manager" && (
                                                        <button
                                                            className="rounded-xl bg-yellow-600 px-3 py-2 text-white hover:bg-yellow-700"
                                                            onClick={async () => {
                                                                try {
                                                                    await API.patch(`/admin/users/${user.id}/role`, { role: "user" });
                                                                    fetchUsers();
                                                                    onAction?.();
                                                                } catch (error) {
                                                                    console.error("Error demoting manager", error);
                                                                }
                                                            }}
                                                        >
                                                            Demote
                                                        </button>
                                                    )}
                                                    <button
                                                        className="rounded-xl bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                                                        onClick={() => setPendingDeleteUser(user)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )}
                                        </td>
                                    </>
                                )}

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan={admin ? 5 : 2}
                                className="text-center py-4 text-gray-500"
                            >
                                No employees found
                            </td>
                        </tr>
                    )}

                </tbody>

            </table>

        </div>

        {pendingDeleteUser && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                role="presentation"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !isDeleting) setPendingDeleteUser(null);
                }}
            >
                <div
                    className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-user-title"
                    aria-describedby="delete-user-description"
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-red-600">Delete account</p>
                            <h2 id="delete-user-title" className="mt-2 text-2xl font-bold text-slate-900">Confirm deletion</h2>
                        </div>
                        <button
                            type="button"
                            aria-label="Cancel deletion"
                            title="Cancel"
                            disabled={isDeleting}
                            onClick={() => setPendingDeleteUser(null)}
                            className="text-3xl leading-none text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            ×
                        </button>
                    </div>
                    <p id="delete-user-description" className="mt-4 text-base leading-7 text-slate-600">
                        Are you sure you want to delete this {pendingDeleteUser.role === "manager" ? "manager" : "employee"}, <span className="font-semibold text-slate-900">{pendingDeleteUser.name}</span>?
                    </p>
                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setPendingDeleteUser(null)}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={confirmDelete}
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>

    );

};

export default UserTable;
