import { TASK_STATUS_OPTIONS } from "../../utils/constants";
import ToggleButton from "../common/ToggleButton";

export default function TaskFilters({
  status = "",
  onStatusChange,
  onlyMine = false,
  onOnlyMineChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <span>Status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange?.(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        >
          <option value="">All</option>
          {TASK_STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <ToggleButton
        pressed={onlyMine}
        onPressedChange={onOnlyMineChange}
        label="Assigned To Me"
        description="Focus on work that currently belongs to you."
      />
    </div>
  );
}
