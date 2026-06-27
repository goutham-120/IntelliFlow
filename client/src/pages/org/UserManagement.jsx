import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import useAuth from "../../hooks/useAuth";
import {
  fetchUsers,
  createUser,
  setUserActiveStatus,
} from "../../services/userService";

const EMPTY_FORM = { name: "", email: "", password: "", role: "user" };

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent || "text-white"}`}>{value}</p>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-400"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        role === "admin"
          ? "bg-violet-500/15 text-violet-300"
          : "bg-slate-800 text-slate-300"
      }`}
    >
      {role}
    </span>
  );
}

// ─── Create user form ──────────────────────────────────────────────────────────
function CreateUserForm({ formData, onChange, onCancel, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        required
        value={formData.name}
        onChange={(e) => onChange({ ...formData, name: e.target.value })}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={formData.email}
        onChange={(e) => onChange({ ...formData, email: e.target.value })}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={formData.password}
        onChange={(e) => onChange({ ...formData, password: e.target.value })}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      />
      <select
        value={formData.role}
        onChange={(e) => onChange({ ...formData, role: e.target.value })}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-700 px-4 py-2 text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
        >
          Create
        </button>
      </div>
    </form>
  );
}

// ─── Users table ────────────────────────────────────────────────────────────────
function UsersTable({ users, currentUserId, isAdmin, onToggleStatus, togglingId }) {
  if (!users.length) {
    return <p className="p-6 text-sm text-slate-400">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[640px] text-left text-slate-200">
        <thead className="bg-slate-900/90 text-sm text-slate-400">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
            {isAdmin && <th className="p-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const active = user.isActive !== false;
            const isSelf = String(user._id) === String(currentUserId);
            return (
              <tr key={user._id} className="border-t border-slate-800/80 hover:bg-white/5">
                <td className="p-4 text-white">{user.name}</td>
                <td className="p-4 text-slate-300">{user.email}</td>
                <td className="p-4"><RoleBadge role={user.role} /></td>
                <td className="p-4"><StatusBadge active={active} /></td>
                {isAdmin && (
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onToggleStatus(user, !active)}
                      disabled={isSelf || togglingId === user._id}
                      title={isSelf ? "You can't change your own status" : ""}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        active
                          ? "border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                          : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
                      }`}
                    >
                      {togglingId === user._id
                        ? "Saving..."
                        : active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [togglingId, setTogglingId] = useState(null);

  const loadUsers = async () => {
    setError("");
    try {
      setUsers(await fetchUsers());
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.isActive !== false).length;
    const admins = users.filter((u) => u.role === "admin").length;
    return {
      total: users.length,
      active,
      inactive: users.length - active,
      admins,
    };
  }, [users]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createUser(formData);
      setFormOpen(false);
      setFormData(EMPTY_FORM);
      setSuccess("User created successfully");
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "User creation failed");
    }
  };

  const handleToggleStatus = async (user, nextActive) => {
    setError("");
    setSuccess("");
    setTogglingId(user._id);
    try {
      await setUserActiveStatus(user._id, nextActive);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: nextActive } : u))
      );
      setSuccess(nextActive ? "User activated" : "User deactivated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Add workspace members, manage roles, and control account access.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            + Add User
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Active" value={stats.active} accent="text-emerald-400" />
        <StatCard label="Inactive" value={stats.inactive} accent="text-slate-400" />
        <StatCard label="Admins" value={stats.admins} accent="text-violet-400" />
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/12 p-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        {loading ? (
          <div className="p-6"><Loader label="Loading users..." /></div>
        ) : (
          <UsersTable
            users={users}
            currentUserId={currentUser?._id}
            isAdmin={isAdmin}
            onToggleStatus={handleToggleStatus}
            togglingId={togglingId}
          />
        )}
      </div>

      {/* Create user modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Create New Account"
        description="Admins can manage reporting and setup. Users can join teams and receive task assignments."
        size="sm"
      >
        <CreateUserForm
          formData={formData}
          onChange={setFormData}
          onCancel={() => setFormOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      </Modal>
    </div>
  );
}