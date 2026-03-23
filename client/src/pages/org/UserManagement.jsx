import { useEffect, useState } from "react";
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
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "User creation failed");
    }
  };

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          User Management
        </h1>

        <button
          onClick={() => setFormOpen(true)}
          className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:scale-[1.03] transition"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-300">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">

        {loading ? (
          <div className="p-6 text-slate-400">Loading users...</div>
        ) : (
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* Add User Modal */}
      {formOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md space-y-5">

            <h2 className="text-xl font-semibold text-white">
              Create New User
            </h2>

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
          </div>
        </div>
      )}
    </div>
  );
}
