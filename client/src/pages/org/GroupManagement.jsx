import { useEffect, useMemo, useState } from "react";
import { fetchUsers } from "../../services/userService";
import {
  addGroupMember,
  createGroup,
  fetchGroupMembers,
  fetchGroups,
  removeGroupMember,
  updateGroup,
  updateGroupMemberRole,
} from "../../services/groupService";

const defaultGroupForm = {
  name: "",
  code: "",
  description: "",
};

const defaultMemberForm = {
  userId: "",
  roleInGroup: "member",
};

export default function GroupManagement() {
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedUser?.role === "admin";

  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [groupForm, setGroupForm] = useState(defaultGroupForm);
  const [memberForm, setMemberForm] = useState(defaultMemberForm);
  const [editGroupForm, setEditGroupForm] = useState({});

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId) || null,
    [groups, selectedGroupId]
  );

  const availableUsers = useMemo(() => {
    const memberUserIds = new Set(
      memberships.map((membership) => membership.userId?._id).filter(Boolean)
    );
    return users.filter((user) => !memberUserIds.has(user._id));
  }, [memberships, users]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const data = await fetchGroups();
      setGroups(data || []);

      if (!selectedGroupId && data?.length) {
        setSelectedGroupId(data[0]._id);
      } else if (selectedGroupId && !data?.some((g) => g._id === selectedGroupId)) {
        setSelectedGroupId(data?.[0]?._id || "");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teams");
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await fetchUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    }
  };

  const loadMembers = async (groupId) => {
    if (!groupId) {
      setMemberships([]);
      return;
    }
    setLoadingMembers(true);
    try {
      const data = await fetchGroupMembers(groupId);
      setMemberships(data?.memberships || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadGroups();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadMembers(selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    clearMessages();
    setSubmitting(true);
    try {
      const data = await createGroup(groupForm);
      setSuccess(data?.message || "Team created");
      setGroupForm(defaultGroupForm);
      setOpenCreateModal(false);
      await loadGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;
    clearMessages();
    setSubmitting(true);
    try {
      const payload = {};
      if (editGroupForm.name?.trim()) payload.name = editGroupForm.name;
      if (editGroupForm.code?.trim()) payload.code = editGroupForm.code;
      if (typeof editGroupForm.description === "string") {
        payload.description = editGroupForm.description;
      }

      if (!Object.keys(payload).length) {
        setError("Provide at least one field to update");
        return;
      }

      const data = await updateGroup(selectedGroup._id, payload);
      setSuccess(data?.message || "Team updated");
      setEditGroupForm({});
      await loadGroups();
      await loadMembers(selectedGroup._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!selectedGroup) return;
    clearMessages();
    setSubmitting(true);
    try {
      const data = await addGroupMember(selectedGroup._id, memberForm);
      setSuccess(data?.message || "Member added");
      setMemberForm(defaultMemberForm);
      setOpenMemberModal(false);
      await loadMembers(selectedGroup._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMembershipRole = async (userId, roleInGroup) => {
    if (!selectedGroup) return;
    clearMessages();
    try {
      const data = await updateGroupMemberRole(selectedGroup._id, userId, roleInGroup);
      setSuccess(data?.message || "Membership role updated");
      await loadMembers(selectedGroup._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member role");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedGroup) return;
    clearMessages();
    try {
      const data = await removeGroupMember(selectedGroup._id, userId);
      setSuccess(data?.message || "Member removed");
      await loadMembers(selectedGroup._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  const activeGroupsCount = groups.filter((group) => group.isActive).length;
  const activeMembersCount = memberships.filter(
    (membership) => membership.userId?.isActive
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-700/80 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_20%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-200/80">
              Responsibility Units
            </p>
            <h1 className="mt-2 font-['Baloo_2'] text-3xl font-bold text-white">
              Team Management
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage cross-functional teams and membership authority without fixed
              hierarchy.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/54 px-4 py-3">
              <p className="text-xs text-slate-400">Teams</p>
              <p className="text-xl font-semibold text-white">
                {groups.length}
                <span className="ml-2 text-sm text-teal-300">
                  {activeGroupsCount} active
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/54 px-4 py-3">
              <p className="text-xs text-slate-400">Members in selected</p>
              <p className="text-xl font-semibold text-white">
                {memberships.length}
                <span className="ml-2 text-sm text-sky-300">
                  {activeMembersCount} active
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            error
              ? "border-red-400/30 bg-red-500/12 text-red-200"
              : "border-teal-400/30 bg-teal-400/12 text-teal-200"
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-[2rem] border border-slate-700/80 bg-slate-950/72 p-5 text-sm text-slate-300 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
        <p className="font-medium text-white">Beginner guide</p>
        <p className="mt-2 text-slate-300">
          A team works like a responsibility bucket. Workflows assign stages to teams, and
          team members can then take responsibility for tasks that enter those stages.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-[2rem] border border-slate-700/80 bg-slate-950/72 p-4 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Baloo_2'] text-lg font-semibold text-white">Teams</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  clearMessages();
                  setOpenCreateModal(true);
                }}
                className="rounded-xl border border-teal-400/25 bg-teal-400/12 px-3 py-1.5 text-sm font-medium text-teal-200 transition hover:border-teal-300/40 hover:bg-teal-400/18"
              >
                + New
              </button>
            )}
          </div>

          {loadingGroups ? (
            <p className="text-sm text-slate-400">Loading teams...</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-slate-400">No teams available.</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroupId(group._id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedGroupId === group._id
                      ? "border-teal-300/30 bg-teal-400/12 shadow-[0_12px_24px_rgba(8,15,31,0.2)]"
                      : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{group.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        group.isActive
                          ? "bg-teal-400/16 text-teal-200"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {group.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs tracking-wider text-sky-300">
                    {group.code}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                    {group.description || "No description"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-slate-700/80 bg-slate-950/72 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)]">
          {!selectedGroup ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">
              Select a team on the left to review its members, edit its details, and
              manage who can lead or administer it.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/80 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-['Baloo_2'] text-2xl font-semibold text-white">
                    {selectedGroup.name}
                  </h3>
                  <p className="mt-1 text-xs tracking-[0.2em] text-sky-300">
                    {selectedGroup.code}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    {selectedGroup.description || "No description added for this team."}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => setOpenMemberModal(true)}
                      className="rounded-xl border border-teal-400/25 bg-teal-400/12 px-4 py-2 text-sm font-medium text-teal-200 transition hover:border-teal-300/40 hover:bg-teal-400/18"
                    >
                      Add Member
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/72 p-4">
                  <p className="mb-3 text-sm font-medium text-white">Quick Update Team</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={editGroupForm.name || ""}
                      onChange={(event) =>
                        setEditGroupForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-teal-300"
                    />
                    <input
                      type="text"
                      placeholder="Code"
                      value={editGroupForm.code || ""}
                      onChange={(event) =>
                        setEditGroupForm((prev) => ({ ...prev, code: event.target.value }))
                      }
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-teal-300"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={editGroupForm.description || ""}
                      onChange={(event) =>
                        setEditGroupForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-teal-300"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleUpdateGroup}
                      disabled={submitting}
                      className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:opacity-60"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="border-b border-slate-800 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Memberships</p>
                </div>

                {loadingMembers ? (
                  <p className="p-4 text-sm text-slate-400">Loading members...</p>
                ) : memberships.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400">No members in this team yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">System Role</th>
                          <th className="px-4 py-3">Role In Team</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberships.map((membership) => (
                          <tr
                            key={membership._id}
                            className="border-t border-slate-800 hover:bg-white/5"
                          >
                            <td className="px-4 py-3 font-medium text-white">
                              {membership.userId?.name || "-"}
                            </td>
                            <td className="px-4 py-3">{membership.userId?.email || "-"}</td>
                            <td className="px-4 py-3 capitalize text-slate-300">
                              {membership.userId?.role}
                            </td>
                            <td className="px-4 py-3">
                              {isAdmin ? (
                                <select
                                  value={membership.roleInGroup}
                                  onChange={(event) =>
                                    handleUpdateMembershipRole(
                                      membership.userId?._id,
                                      event.target.value
                                    )
                                  }
                                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 outline-none transition focus:border-teal-300"
                                >
                                  <option value="member">member</option>
                                  <option value="team_lead">Team Lead</option>
                                </select>
                              ) : (
                                <span className="capitalize">
                                  {membership.roleInGroup === "team_lead"
                                    ? "Team Lead"
                                    : membership.roleInGroup}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isAdmin ? (
                                <button
                                  onClick={() => handleRemoveMember(membership.userId?._id)}
                                  className="rounded-lg border border-red-400/30 bg-red-500/12 px-2 py-1 text-xs text-red-200 transition hover:bg-red-500/18"
                                >
                                  Remove
                                </button>
                              ) : (
                                <span className="text-xs text-slate-500">View only</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {openCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-700 bg-slate-950 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <h3 className="font-['Baloo_2'] text-xl font-semibold text-white">Create Team</h3>
            <p className="mt-1 text-sm text-slate-400">
              Define a team for workflow stage assignments.
            </p>

            <form className="mt-5 space-y-3" onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Team Name"
                required
                value={groupForm.name}
                onChange={(event) =>
                  setGroupForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 outline-none transition focus:border-teal-300"
              />
              <input
                type="text"
                placeholder="Team Code"
                required
                value={groupForm.code}
                onChange={(event) =>
                  setGroupForm((prev) => ({ ...prev, code: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 uppercase text-slate-200 outline-none transition focus:border-teal-300"
              />
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={groupForm.description}
                onChange={(event) =>
                  setGroupForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 outline-none transition focus:border-teal-300"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:opacity-60"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-700 bg-slate-950 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <h3 className="font-['Baloo_2'] text-xl font-semibold text-white">
              Add Team Member
            </h3>
            <form className="mt-4 space-y-3" onSubmit={handleAddMember}>
              <select
                required
                value={memberForm.userId}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, userId: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 outline-none transition focus:border-teal-300"
              >
                <option value="">Select user</option>
                {availableUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <select
                value={memberForm.roleInGroup}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, roleInGroup: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 outline-none transition focus:border-teal-300"
              >
                <option value="member">member</option>
                <option value="team_lead">Team Lead</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenMemberModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:opacity-60"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
