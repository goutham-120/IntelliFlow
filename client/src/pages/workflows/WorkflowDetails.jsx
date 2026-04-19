import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import WorkflowForm from "../../components/workflows/WorkflowForm";
import { fetchGroups } from "../../services/groupService";
import {
  fetchWorkflowById,
  updateWorkflow as updateWorkflowService,
} from "../../services/workflowService";

export default function WorkflowDetails() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [workflowData, groupsData] = await Promise.all([
        fetchWorkflowById(workflowId),
        fetchGroups(),
      ]);
      setWorkflow(workflowData);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (payload) => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const result = await updateWorkflowService(workflowId, payload);
      setSuccess(result?.message || "Workflow updated successfully");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update workflow");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !workflow) {
    return (
      <div className="space-y-4">
        <p className="text-slate-300">Workflow not found.</p>
        <button
          onClick={() => navigate("/workflows")}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300"
        >
          Back to Workflows
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <h1 className="text-3xl font-bold text-white">Workflow Details</h1>
        <p className="text-sm text-slate-300">
          Review stage sequence, team ownership, and whether this workflow should stay
          active for new tasks.
        </p>
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

      <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        {loading ? (
          <div className="text-slate-400">Loading workflow...</div>
        ) : (
          <>
            <div className="mb-5 rounded-2xl border border-slate-800/90 bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">How to edit this workflow</p>
              <p className="mt-2 text-slate-400">
                Each stage represents one ordered stop in the process. The assigned team
                becomes responsible when a task reaches that stage.
              </p>
            </div>
            <WorkflowForm
              key={`${workflow?._id}-${workflow?.updatedAt || "fresh"}`}
              initialValues={workflow}
              groups={groups}
              submitting={submitting}
              submitLabel="Save Workflow"
              onSubmit={handleSubmit}
            />
            <div className="mt-4">
              <Link
                to="/workflows"
                className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Back to Workflows
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
