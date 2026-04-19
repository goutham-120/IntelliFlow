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
          className="grid gap-3 rounded-2xl border border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.06),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.84))] p-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            type="text"
            placeholder={`Stage ${index + 1} name`}
            value={stage.name}
            onChange={(event) => onStageChange(index, "name", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            required
            disabled={disabled}
          />
          <select
            value={stage.groupId}
            onChange={(event) => onStageChange(index, "groupId", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            required
            disabled={disabled}
          >
            <option value="">Select Team</option>
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
            className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-rose-200 transition hover:bg-rose-500/16 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddStage}
        disabled={disabled}
        className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 transition hover:bg-emerald-500/16 disabled:opacity-60"
      >
        + Add Stage
      </button>
    </div>
  );
}
