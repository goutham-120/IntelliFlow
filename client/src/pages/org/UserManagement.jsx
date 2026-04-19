import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import { fetchUsers, createUser } from "../../services/userService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUser(formData);
      setFormOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
      });
      setError("");
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "User creation failed");
    }
  };

  const activeUsers = useMemo(
    () => users.filter((user) => user?.isActive !== false).length,
    [users]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-700/80 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_20%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200/80">
              Access Management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">User Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Add operational users to the organization. These users can join teams,
              receive tasks, and participate in workflows.
            </p>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.03]"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[28px] border border-[#e8e8e4] bg-white p-5 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{users.length}</p>
        </article>
        <article className="rounded-[28px] border border-[#e8e8e4] bg-white p-5 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
          <p className="text-sm text-slate-500">Active Users</p>
          <p className="mt-3 text-3xl font-bold text-emerald-300">{activeUsers}</p>
        </article>
        <article className="rounded-[28px] border border-[#e8e8e4] bg-white p-5 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
          <p className="text-sm text-slate-500">Beginner Note</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Users are regular workspace members. Team roles and task ownership are
            assigned after a user account exists.
          </p>
        </article>
      </section> */}

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/12 p-3 text-red-200">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-[28px] border border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl">
        {loading ? (
          <div className="p-6"><Loader label="Loading users..." /></div>
        ) : (
          <table className="w-full text-left text-slate-200">
            <thead className="bg-slate-900/90 text-sm text-slate-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">State</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-slate-800/80 transition hover:bg-white/5"
                >
                  <td className="p-4 text-white">{user.name}</td>
                  <td className="p-4 text-slate-300">{user.email}</td>
                  <td className="p-4 capitalize text-slate-200">{user.role}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${
                      user?.isActive === false
                        ? "bg-slate-800 text-slate-300"
                        : "bg-teal-400/16 text-teal-200"
                    }`}>
                      {user?.isActive === false ? "inactive" : "active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Create New User"
        description="Create a workspace member who can later be placed into teams and receive task assignments."
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="user">User</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold"
                >
                  Create
                </button>
              </div>

        </form>
      </Modal>
    </div>
  );
}
