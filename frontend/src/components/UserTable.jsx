import React, { useEffect, useState } from "react";
import API from "./services/api";

const UserTable = ({ admin = false, refreshFlag = 0, onAction }) => {

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {

        try {

            const endpoint = admin
                ? "/admin/users"
                : "/users";

            const response = await API.get(endpoint);

            setUsers(response.data);

        } catch (error) {

            console.error("Error fetching users", error);

        }

    };

    useEffect(() => {

        fetchUsers();

    }, [refreshFlag]);

    return (

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
                                    Actions
                                </th>
                            </>
                        )}

                    </tr>

                </thead>

                <tbody>

                    {users.length > 0 ? (

                        users.map((user) => (

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
                                                        onClick={async () => {
                                                            if (!window.confirm(`Delete ${user.name}?`)) return;
                                                            try {
                                                                await API.delete(`/admin/users/${user.id}`);
                                                                fetchUsers();
                                                                onAction?.();
                                                            } catch (error) {
                                                                console.error("Error deleting employee", error);
                                                            }
                                                        }}
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
                                colSpan={admin ? 4 : 2}
                                className="text-center py-4 text-gray-500"
                            >
                                No employees found
                            </td>
                        </tr>
                    )}

                </tbody>

            </table>

        </div>

    );

};

export default UserTable;