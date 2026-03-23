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
        setError(err.response?.data?.message || "Failed to load groups");
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h1 className="text-3xl font-bold text-white">Create Workflow</h1>
        <p className="text-sm text-slate-400">Define a new workflow and assign each stage to a group.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        {loading ? (
          <div className="text-slate-400">Loading groups...</div>
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
