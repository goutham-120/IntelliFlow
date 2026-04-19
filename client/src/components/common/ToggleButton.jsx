export default function ToggleButton({
  pressed = false,
  onPressedChange,
  label,
  description,
  disabled = false,
  className = "",
  variant = "light",
}) {
  const isDark = variant === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      disabled={disabled}
      onClick={() => onPressedChange?.(!pressed)}
      className={`group inline-flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
        isDark
          ? pressed
            ? "border-emerald-400/50 bg-emerald-500/15 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
            : "border-slate-700 bg-slate-950/80 text-slate-300 hover:border-slate-500 hover:bg-slate-900"
          : pressed
          ? "border-emerald-300 bg-emerald-50 text-emerald-950 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]"
          : "border-[#dfe7df] bg-[#f7faf7] text-slate-800 hover:border-[#cbd8cb] hover:bg-white"
      } disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          pressed ? "bg-emerald-500/80" : isDark ? "bg-slate-700" : "bg-slate-300"
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
          <span
            className={`mt-0.5 block text-xs ${
              isDark
                ? "text-slate-400 group-aria-checked:text-emerald-100"
                : "text-slate-500 group-aria-checked:text-emerald-700"
            }`}
          >
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
