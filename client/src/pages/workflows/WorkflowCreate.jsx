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
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e8e4] bg-[radial-gradient(circle_at_top_left,rgba(216,237,230,0.9),transparent_28%),linear-gradient(180deg,#ffffff,#f9f9f7)] p-6 shadow-[0_18px_50px_rgba(17,17,17,0.06)]">
        <h1 className="text-3xl font-bold text-slate-900">Create Workflow</h1>
        <p className="text-sm text-slate-600">
          Define a new workflow, tune its lifecycle, and map every stage to a responsible team.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-[28px] border border-[#e8e8e4] bg-white p-6 shadow-[0_12px_35px_rgba(17,17,17,0.05)]">
        {loading ? (
          <div className="text-slate-500">Loading teams...</div>
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
