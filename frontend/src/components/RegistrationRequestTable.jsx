import React, { useEffect, useState } from "react";
import API from "./services/api";

const RegistrationRequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/registration-requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching registration requests", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    try {
      await API.put(`/admin/registration-requests/${id}/approve`);
      fetchRequests();
    } catch (error) {
      console.error("Error approving request", error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await API.delete(`/admin/registration-requests/${id}`);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Registration Requests</h3>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-[#193680] text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{request.name}</td>
                  <td className="px-4 py-3">{request.email}</td>
                  <td className="px-4 py-3">{request.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="rounded-xl bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                      onClick={() => approveRequest(request.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="rounded-xl bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                      onClick={() => rejectRequest(request.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No pending registration requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationRequestTable;
