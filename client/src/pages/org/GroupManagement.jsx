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
      <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-teal-100/70 p-6 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.45)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-600/80">
              Responsibility Units
            </p>
            <h1 className="mt-2 font-['Baloo_2'] text-3xl font-bold text-slate-900">
              Team Management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage cross-functional teams and membership authority without fixed
              hierarchy.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm shadow-emerald-100">
              <p className="text-xs text-slate-500">Teams</p>
              <p className="text-xl font-semibold text-slate-900">
                {groups.length}
                <span className="ml-2 text-sm text-emerald-600">
                  {activeGroupsCount} active
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm shadow-emerald-100">
              <p className="text-xs text-slate-500">Members in selected</p>
              <p className="text-xl font-semibold text-slate-900">
                {memberships.length}
                <span className="ml-2 text-sm text-teal-600">
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
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 text-sm text-slate-600 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
        <p className="font-medium text-slate-900">Beginner guide</p>
        <p className="mt-2 text-slate-600">
          A team works like a responsibility bucket. Workflows assign stages to teams, and
          team members can then take responsibility for tasks that enter those stages.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-['Baloo_2'] text-lg font-semibold text-slate-900">Teams</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  clearMessages();
                  setOpenCreateModal(true);
                }}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                + New
              </button>
            )}
          </div>

          {loadingGroups ? (
            <p className="text-sm text-slate-500">Loading teams...</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-slate-500">No teams available.</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroupId(group._id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedGroupId === group._id
                      ? "border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-100"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{group.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        group.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {group.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs tracking-wider text-teal-600">
                    {group.code}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                    {group.description || "No description"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
          {!selectedGroup ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center text-slate-500">
              Select a team on the left to review its members, edit its details, and
              manage who can lead or administer it.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/80 to-teal-100/70 p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-['Baloo_2'] text-2xl font-semibold text-slate-900">
                    {selectedGroup.name}
                  </h3>
                  <p className="mt-1 text-xs tracking-[0.2em] text-teal-600">
                    {selectedGroup.code}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    {selectedGroup.description || "No description added for this team."}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => setOpenMemberModal(true)}
                      className="rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-700 transition hover:border-teal-300 hover:bg-teal-50"
                    >
                      Add Member
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-800">Quick Update Team</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={editGroupForm.name || ""}
                      onChange={(event) =>
                        setEditGroupForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                    />
                    <input
                      type="text"
                      placeholder="Code"
                      value={editGroupForm.code || ""}
                      onChange={(event) =>
                        setEditGroupForm((prev) => ({ ...prev, code: event.target.value }))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
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
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleUpdateGroup}
                      disabled={submitting}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Memberships</p>
                </div>

                {loadingMembers ? (
                  <p className="p-4 text-sm text-slate-500">Loading members...</p>
                ) : memberships.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">No members in this team yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm text-slate-600">
                      <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-slate-500">
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
                            className="border-t border-slate-100 hover:bg-emerald-50/60"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {membership.userId?.name || "-"}
                            </td>
                            <td className="px-4 py-3">{membership.userId?.email || "-"}</td>
                            <td className="px-4 py-3 capitalize text-slate-700">
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
                                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-emerald-300"
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
                                  className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 transition hover:bg-red-100"
                                >
                                  Remove
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">View only</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <h3 className="font-['Baloo_2'] text-xl font-semibold text-slate-900">Create Team</h3>
            <p className="mt-1 text-sm text-slate-500">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
              <input
                type="text"
                placeholder="Team Code"
                required
                value={groupForm.code}
                onChange={(event) =>
                  setGroupForm((prev) => ({ ...prev, code: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 uppercase text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={groupForm.description}
                onChange={(event) =>
                  setGroupForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
            <h3 className="font-['Baloo_2'] text-xl font-semibold text-slate-900">
              Add Team Member
            </h3>
            <form className="mt-4 space-y-3" onSubmit={handleAddMember}>
              <select
                required
                value={memberForm.userId}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, userId: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                <option value="member">member</option>
                <option value="team_lead">Team Lead</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenMemberModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
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
