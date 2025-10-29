/**
 * Admin Dashboard Component
 */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

interface AnalyticsData {
  total_users: number;
  total_orders: number;
  total_designs: number;
  total_revenue: number;
  top_designs: Array<{
    id: string;
    prompt: string;
    purchases: number;
  }>;
}

interface UserData {
  _id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  created_at: string;
  store_credits: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const USER_LIST_LIMIT = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [telegramSuccess, setTelegramSuccess] = useState("");

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchAnalytics();
    fetchUsers();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN_ANALYTICS}`,
        {
          headers: authService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err) {
      setError("Failed to load analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: authService.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const testTelegramNotification = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN_TELEGRAM_TEST}`,
        {
          method: "POST",
          headers: authService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        setTelegramSuccess("Test notification sent successfully!");
        setTimeout(() => setTelegramSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to send test notification");
      }
    } catch (err) {
      setError("Failed to send test notification");
    }
  };

  const sendDailyReport = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN_DAILY_REPORT}`,
        {
          method: "POST",
          headers: authService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        setTelegramSuccess("Daily report sent successfully!");
        setTimeout(() => setTelegramSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to send daily report");
      }
    } catch (err) {
      setError("Failed to send daily report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="text-sm text-gray-600">Welcome, {user?.username}</div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {telegramSuccess && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="text-sm text-green-800">{telegramSuccess}</div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500">Total Users</dt>
              <dd className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.total_users || 0}
              </dd>
              <p className="mt-1 text-sm text-gray-500">
                Active registered users
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-indigo-500">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500">
                Total Orders
              </dt>
              <dd className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.total_orders || 0}
              </dd>
              <p className="mt-1 text-sm text-gray-500">Orders placed</p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500">
                Total Designs
              </dt>
              <dd className="mt-2 text-3xl font-bold text-gray-900">
                {analytics?.total_designs || 0}
              </dd>
              <p className="mt-1 text-sm text-gray-500">Designs uploaded</p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
            <div className="p-5">
              <dt className="text-sm font-medium text-gray-500">
                Total Revenue
              </dt>
              <dd className="mt-2 text-3xl font-bold text-gray-900">
                ${analytics?.total_revenue?.toFixed(2) || "0.00"}
              </dd>
              <p className="mt-1 text-sm text-gray-500">Revenue (USD)</p>
            </div>
          </div>
        </div>

        {/* Top Designs */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Top Designs</h2>
            <div className="text-sm text-gray-500">Most purchased</div>
          </div>
          {analytics?.top_designs && analytics.top_designs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.top_designs.slice(0, 6).map((d) => (
                <div
                  key={d.id}
                  className="p-4 border rounded-md hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm text-gray-700">{d.prompt}</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {d.purchases}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No designs yet</p>
          )}
        </div>

        {/* Admin Actions & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={testTelegramNotification}
                className="w-full px-4 py-2 rounded-md border border-gray-200 text-sm font-medium"
              >
                Test Telegram Notification
              </button>
              <button
                onClick={sendDailyReport}
                className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
              >
                Send Daily Report
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Registered Users
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              All registered users ({users.length})
            </p>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-sm text-center text-gray-500"
                      >
                        No users yet
                      </td>
                    </tr>
                  ) : (
                    users.slice(0, USER_LIST_LIMIT).map((u) => (
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* View all button */}
            {users.length > USER_LIST_LIMIT && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => navigate("/admin/users")}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50"
                >
                  View all users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
