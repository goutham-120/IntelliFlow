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
      <div className="flex flex-col gap-4 rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200/80">
            Process Design
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-slate-300">
            Define stage sequence, team ownership, and visibility of inactive flows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleButton
            pressed={includeInactive}
            onPressedChange={setIncludeInactive}
            label="Show Inactive"
            description="Include archived or disabled workflows in the list."
            variant="dark"
          />
          {isAdmin && (
            <Link
              to="/workflows/create"
              className="rounded-2xl bg-[linear-gradient(135deg,#0f766e,#14b8a6)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,118,110,0.28)] transition hover:brightness-110"
            >
              + New Workflow
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-3 text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/12 p-3 text-emerald-200">
          {success}
        </div>
      )}

      <section className="overflow-hidden rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        {loading ? (
          <div className="p-6 text-slate-400">Loading workflows...</div>
        ) : !workflows.length ? (
          <div className="p-6 text-slate-400">No workflows found.</div>
        ) : (
          <div className="divide-y divide-slate-800/90">
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
