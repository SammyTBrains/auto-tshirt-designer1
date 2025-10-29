/**
 * User Profile Page Component
 */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

const Profile: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USER_TRANSACTIONS}`,
        {
          headers: authService.getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await authService.updateProfile(formData);
      await refreshUser();
      setSuccess("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Avatar & quick stats */}
          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-xl p-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                  {user.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                    : (user.username || user.email).slice(0, 2).toUpperCase()}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 text-center">
                  {user.full_name || user.username}
                </h3>
                <p className="text-sm text-gray-500 text-center break-all">{user.email}</p>
                <div className="mt-4 w-full grid grid-cols-3 gap-3 border-t pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.store_credits}</div>
                    <div className="text-xs text-gray-500">Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{(user as any).design_count ?? 0}</div>
                    <div className="text-xs text-gray-500">Designs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900 capitalize pt-1">{user.role}</div>
                    <div className="text-xs text-gray-500">Role</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white shadow-md rounded-xl p-4 space-y-3">
              <button
                onClick={() => navigate("/custom-design")}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg transition"
              >
                Create New Design
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Browse Shop
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="w-full px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Middle: Profile Details / Edit Form */}
          <div className="lg:col-span-2 min-w-0">
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Profile Information
              </h2>

              {error && (
                <div className="rounded-md bg-red-50 p-3 mb-4 text-sm text-red-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-3 mb-4 text-sm text-green-800">
                  {success}
                </div>
              )}

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          username: user.username,
                          full_name: user.full_name || "",
                        });
                        setError("");
                      }}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-base font-medium text-gray-900">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Username</div>
                    <div className="text-base font-medium text-gray-900">
                      {user.username}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Full name</div>
                    <div className="text-base font-medium text-gray-900">
                      {user.full_name || "Not set"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transactions (compact) */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Transaction History
              </h3>
              {loading ? (
                <div className="py-8 text-center text-gray-500">
                  Loading transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-gray-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tx.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${
                            tx.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </div>
                        <div className="text-xs text-gray-500">
                          Bal: {tx.balance_after}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
