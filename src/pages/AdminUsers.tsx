import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { API_BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";

interface UserData {
  _id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  created_at: string;
  store_credits: number;
}

const PAGE_SIZE = 25;

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: authService.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const current = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm"
            >
              Back to dashboard
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No users found</div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {current.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {u.full_name || u.username}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {u.store_credits}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {current.length} of {users.length} users
                </div>
                <div className="space-x-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm"
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    {page} / {pageCount}
                  </span>
                  <button
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
