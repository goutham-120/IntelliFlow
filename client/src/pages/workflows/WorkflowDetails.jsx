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
      <div className="rounded-[32px] border border-[#e8e8e4] bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_28%),linear-gradient(180deg,#ffffff,#f9f9f7)] p-6 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
        <h1 className="text-3xl font-bold text-slate-900">Workflow Details</h1>
        <p className="text-sm text-slate-600">
          Review stage sequence, team ownership, and whether this workflow should stay
          active for new tasks.
        </p>
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

      <section className="rounded-[28px] border border-[#e8e8e4] bg-white p-6 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
        {loading ? (
          <div className="text-slate-500">Loading workflow...</div>
        ) : (
          <>
            <div className="mb-5 rounded-2xl border border-[#e8e8e4] bg-[#fbfbfa] p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">How to edit this workflow</p>
              <p className="mt-2 text-slate-500">
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
                className="rounded-xl border border-[#e8e8e4] px-4 py-2 text-sm text-slate-700"
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
