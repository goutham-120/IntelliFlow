export default function ToggleButton({
  pressed = false,
  onPressedChange,
  label,
  description,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      disabled={disabled}
      onClick={() => onPressedChange?.(!pressed)}
      className={`group inline-flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
        pressed
          ? "border-emerald-400/50 bg-emerald-500/15 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
          : "border-slate-700 bg-slate-950/80 text-slate-300 hover:border-slate-500 hover:bg-slate-900"
      } disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          pressed ? "bg-emerald-400/80" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-flex h-5 w-5 rounded-full bg-white shadow transition ${
            pressed ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-slate-400 group-aria-checked:text-emerald-100">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
