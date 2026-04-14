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
      <div className="rounded-[32px] border border-[#e8e8e4] bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_28%),linear-gradient(180deg,#ffffff,#f9f9f7)] p-6 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-700/80">
              Access Management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">User Management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
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

      <section className="grid gap-4 md:grid-cols-3">
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
      </section>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-[#e8e8e4] rounded-[28px] overflow-hidden shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
        {loading ? (
          <div className="p-6"><Loader label="Loading users..." /></div>
        ) : (
          <table className="w-full text-left text-slate-700">
            <thead className="bg-[#f4f6f3] text-slate-500 text-sm">
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
                  className="border-t border-[#eef0ec] hover:bg-[#fbfbfa] transition"
                >
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${
                      user?.isActive === false
                        ? "bg-slate-200 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
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
