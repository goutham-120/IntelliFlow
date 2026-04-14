import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ToggleButton from "../../components/common/ToggleButton";
import WorkflowCard from "../../components/workflows/WorkflowCard";
import { fetchGroups } from "../../services/groupService";
import { fetchWorkflows } from "../../services/workflowService";

export default function WorkflowList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const isAdmin = user?.role === "admin";

  const groupsById = useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group._id] = group;
      return acc;
    }, {});
  }, [groups]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [workflowsData, groupsData] = await Promise.all([
        fetchWorkflows(includeInactive),
        fetchGroups(),
      ]);
      setWorkflows(Array.isArray(workflowsData) ? workflowsData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      setSuccess(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[#e8e8e4] bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_28%),linear-gradient(180deg,#ffffff,#f9f9f7)] p-6 shadow-[0_18px_50px_rgba(17,17,17,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflows</h1>
          <p className="text-sm text-slate-600">
            Define stage sequence, team ownership, and visibility of inactive flows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleButton
            pressed={includeInactive}
            onPressedChange={setIncludeInactive}
            label="Show Inactive"
            description="Include archived or disabled workflows in the list."
          />
          {isAdmin && (
            <Link
              to="/workflows/create"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + New Workflow
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-[28px] border border-[#e8e8e4] bg-white shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
        {loading ? (
          <div className="p-6 text-slate-500">Loading workflows...</div>
        ) : !workflows.length ? (
          <div className="p-6 text-slate-500">No workflows found.</div>
        ) : (
          <div className="divide-y divide-[#eef0ec]">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow._id}
                workflow={workflow}
                groupsById={groupsById}
                showDetailsLink={isAdmin}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
