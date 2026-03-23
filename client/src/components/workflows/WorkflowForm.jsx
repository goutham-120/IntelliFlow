import { useState } from "react";
import WorkflowStageEditor from "./WorkflowStageEditor";

const createEmptyStage = () => ({ name: "", groupId: "" });

const mapIncomingStages = (stages = []) => {
  if (!Array.isArray(stages) || stages.length === 0) {
    return [createEmptyStage()];
  }

  return [...stages]
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({
      name: stage.name || "",
      groupId: typeof stage.groupId === "string" ? stage.groupId : stage.groupId?._id || "",
    }));
};

export default function WorkflowForm({
  initialValues,
  groups,
  submitting = false,
  submitLabel = "Save Workflow",
  onSubmit,
}) {
  const [name, setName] = useState(() => initialValues?.name || "");
  const [isActive, setIsActive] = useState(() => initialValues?.isActive ?? true);
  const [stages, setStages] = useState(() => mapIncomingStages(initialValues?.stages));
  const [error, setError] = useState("");

  const handleStageChange = (index, field, value) => {
    setStages((prev) =>
      prev.map((stage, idx) => (idx === index ? { ...stage, [field]: value } : stage))
    );
  };

  const handleAddStage = () => {
    setStages((prev) => [...prev, createEmptyStage()]);
  };

  const handleRemoveStage = (index) => {
    setStages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const normalizedStages = stages.map((stage, index) => ({
      name: stage.name.trim(),
      groupId: stage.groupId,
      order: index + 1,
    }));

    if (!trimmedName) {
      setError("Workflow name is required");
      return;
    }
    if (!normalizedStages.length) {
      setError("At least one stage is required");
      return;
    }
    if (normalizedStages.some((stage) => !stage.name || !stage.groupId)) {
      setError("Each stage needs a name and group");
      return;
    }

    await onSubmit({
      name: trimmedName,
      isActive,
      stages: normalizedStages,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Workflow Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          required
          disabled={submitting}
        />
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500"
            disabled={submitting}
          />
          Active workflow
        </label>
      </div>

      <WorkflowStageEditor
        stages={stages}
        groups={groups}
        onStageChange={handleStageChange}
        onAddStage={handleAddStage}
        onRemoveStage={handleRemoveStage}
        disabled={submitting}
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-slate-950 disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
