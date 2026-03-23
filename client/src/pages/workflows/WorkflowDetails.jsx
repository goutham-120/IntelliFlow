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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h1 className="text-3xl font-bold text-white">Workflow Details</h1>
        <p className="text-sm text-slate-400">Review and update stage sequence and assignment groups.</p>
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

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        {loading ? (
          <div className="text-slate-400">Loading workflow...</div>
        ) : (
          <>
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
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300"
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
