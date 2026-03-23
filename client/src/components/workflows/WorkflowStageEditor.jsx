export default function WorkflowStageEditor({
  stages,
  groups,
  onStageChange,
  onAddStage,
  onRemoveStage,
  disabled = false,
}) {
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <div
          key={`stage-${index}`}
          className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            type="text"
            placeholder={`Stage ${index + 1} name`}
            value={stage.name}
            onChange={(event) => onStageChange(index, "name", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white"
            required
            disabled={disabled}
          />
          <select
            value={stage.groupId}
            onChange={(event) => onStageChange(index, "groupId", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white"
            required
            disabled={disabled}
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRemoveStage(index)}
            disabled={disabled || stages.length === 1}
            className="rounded-xl bg-slate-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddStage}
        disabled={disabled}
        className="rounded-xl bg-slate-700 px-4 py-2 text-white disabled:opacity-60"
      >
        + Add Stage
      </button>
    </div>
  );
}
