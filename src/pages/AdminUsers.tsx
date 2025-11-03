import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  adminUserService,
  AdminUserRole,
  AdminUserSummary,
} from "../services/adminUserService";

const PAGE_SIZE = 25;

const AdminUsers: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">(
    ""
  );
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  const isAdmin = user?.role === "admin";
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate("/login?redirect=/admin/users", { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/profile", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!loading && page > pageCount) {
      setPage(pageCount);
    }
  }, [loading, page, pageCount]);

  const setUserBusy = useCallback((id: string, busy: boolean) => {
    setRowBusy((prev) => {
      if (busy) {
        return { ...prev, [id]: true };
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await adminUserService.fetchUsers({
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });

      setUsers(response.users);
      setTotal(response.pagination.total);
      setSkip(response.pagination.skip);
    } catch (err) {
      console.error("Failed to load users", err);
      const message =
        err instanceof Error ? err.message : "Failed to load users";
      setError(message);
      setUsers([]);
      setTotal(0);
      setSkip(0);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, debouncedSearch, roleFilter, statusFilter, page]);

  useEffect(() => {
    if (isAdmin && !authLoading) {
      void loadUsers();
    }
  }, [isAdmin, authLoading, loadUsers]);

  const handleRoleChange = async (id: string, role: AdminUserRole) => {
    setUserBusy(id, true);
    try {
      const { user: updated } = await adminUserService.updateUser(id, { role });
      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updated } : entry
        )
      );
      showToast({
        title: "Role updated",
        description: `User is now ${role}.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to update role", err);
      showToast({
        title: "Role update failed",
        description:
          err instanceof Error ? err.message : "Unable to update role.",
        variant: "error",
      });
    } finally {
      setUserBusy(id, false);
    }
  };

  const handleToggleActive = async (id: string, nextStatus: boolean) => {
    setUserBusy(id, true);
    try {
      const { user: updated } = await adminUserService.updateUser(id, {
        is_active: nextStatus,
      });
      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updated } : entry
        )
      );
      showToast({
        title: nextStatus ? "Account activated" : "Account suspended",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to update status", err);
      showToast({
        title: "Status update failed",
        description:
          err instanceof Error ? err.message : "Unable to update status.",
        variant: "error",
      });
    } finally {
      setUserBusy(id, false);
    }
  };

  const handleAdjustCredits = async (id: string) => {
    const amountInput = window.prompt(
      "Adjust store credits (positive to credit, negative to deduct)",
      "10"
    );

    if (amountInput === null) {
      return;
    }

    const amount = Number.parseInt(amountInput, 10);
    if (Number.isNaN(amount) || amount === 0) {
      showToast({
        title: "Invalid amount",
        description: "Enter a non-zero integer.",
        variant: "error",
      });
      return;
    }

    const reasonInput = window.prompt("Reason for adjustment (optional)", "");

    setUserBusy(id, true);
    try {
      const { user: updated } = await adminUserService.adjustCredits(
        id,
        amount,
        reasonInput || undefined
      );

      if (updated) {
        setUsers((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, ...updated } : entry
          )
        );
      }

      showToast({
        title: "Credits updated",
        description: `New balance: ${updated?.store_credits ?? "unknown"}`,
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to adjust credits", err);
      showToast({
        title: "Credit update failed",
        description:
          err instanceof Error ? err.message : "Unable to adjust credits.",
        variant: "error",
      });
    } finally {
      setUserBusy(id, false);
    }
  };

  const handleRefresh = () => {
    void loadUsers();
  };

  const showingStart = total === 0 ? 0 : skip + 1;
  const showingEnd = skip + users.length;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              Back to dashboard
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setPage(1);
                    setSearchTerm(event.target.value);
                  }}
                  placeholder="Search name, email, or id"
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(event) => {
                  setPage(1);
                  setRoleFilter(event.target.value as AdminUserRole | "");
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All roles</option>
                <option value="admin">Admins</option>
                <option value="user">Customers</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1);
                  setStatusFilter(
                    event.target.value as "active" | "inactive" | ""
                  );
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Total users: <span className="font-medium">{total}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading || authLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Credits
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Joined
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((entry) => {
                      const busy = !!rowBusy[entry.id];
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            <div className="flex flex-col">
                              <span>{entry.full_name || entry.username}</span>
                              <span className="text-xs text-gray-500">
                                ID: {entry.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {entry.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <select
                              value={entry.role}
                              onChange={(event) =>
                                handleRoleChange(
                                  entry.id,
                                  event.target.value as AdminUserRole
                                )
                              }
                              disabled={busy}
                              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="user">User</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                handleToggleActive(entry.id, !entry.is_active)
                              }
                              disabled={busy}
                              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                entry.is_active
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              } ${busy ? "opacity-60" : ""}`}
                            >
                              {entry.is_active ? "Active" : "Suspended"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {entry.store_credits}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-500">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button
                              onClick={() => handleAdjustCredits(entry.id)}
                              disabled={busy}
                              className="inline-flex items-center justify-end rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Adjust credits
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  {total === 0
                    ? "No users to display"
                    : `Showing ${showingStart}-${showingEnd} of ${total}`}
                </div>
                <div className="space-x-2 text-sm">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} of {pageCount}
                  </span>
                  <button
                    disabled={page >= pageCount}
                    onClick={() =>
                      setPage((prev) => Math.min(pageCount, prev + 1))
                    }
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
