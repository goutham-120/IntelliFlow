import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WorkflowForm from "../../components/workflows/WorkflowForm";
import { fetchGroups } from "../../services/groupService";
import { createWorkflow } from "../../services/workflowService";

export default function WorkflowCreate() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      setError("");
      try {
        const groupsData = await fetchGroups();
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  const handleSubmit = async (payload) => {
    setError("");
    setSubmitting(true);
    try {
      const result = await createWorkflow(payload);
      navigate("/workflows", {
        state: { message: result?.message || "Workflow created successfully" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create workflow");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_right,rgba(56,189,248,0.12),transparent_22%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.84))] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <h1 className="text-3xl font-bold text-white">Create Workflow</h1>
        <p className="text-sm text-slate-300">
          Define a new workflow, tune its lifecycle, and map every stage to a responsible team.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 p-3 text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))] p-6 shadow-[0_18px_45px_rgba(2,6,23,0.26)]">
        {loading ? (
          <div className="text-slate-400">Loading teams...</div>
        ) : (
          <>
            <WorkflowForm
              key="workflow-create-form"
              initialValues={{ name: "", isActive: true, stages: [] }}
              groups={groups}
              submitting={submitting}
              submitLabel="Create Workflow"
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
