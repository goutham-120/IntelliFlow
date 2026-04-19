import { useState } from "react";
import ToggleButton from "../common/ToggleButton";
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
      setError("Each stage needs a name and team");
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <input
          type="text"
          placeholder="Workflow Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
          required
          disabled={submitting}
        />
        <ToggleButton
          pressed={isActive}
          onPressedChange={setIsActive}
          label="Active Workflow"
          description="Inactive workflows stay visible but should not be used for new routing."
          disabled={submitting}
          variant="dark"
        />
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
        className="rounded-xl bg-[linear-gradient(135deg,#0f766e,#10b981)] px-5 py-2 font-semibold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:brightness-105 disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
