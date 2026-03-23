import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workflows</h1>
          <p className="text-sm text-slate-400">Define stage sequence and group ownership.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500"
            />
            Show inactive
          </label>
          {isAdmin && (
            <Link
              to="/workflows/create"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              + New Workflow
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 p-3 text-emerald-300">
          {success}
        </div>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50">
        {loading ? (
          <div className="p-6 text-slate-400">Loading workflows...</div>
        ) : !workflows.length ? (
          <div className="p-6 text-slate-400">No workflows found.</div>
        ) : (
          <div className="divide-y divide-slate-800">
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
