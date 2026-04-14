import { useTheme } from "../../context/ThemeContext";

export default function Loader({ label = "Loading...", className = "" }) {
  const { isLightTheme } = useTheme();

  return (
    <div
      className={`flex items-center gap-3 ${
        isLightTheme ? "text-slate-500" : "text-slate-300"
      } ${className}`.trim()}
    >
      <span
        className={`inline-flex h-5 w-5 animate-spin rounded-full border-2 border-t-emerald-500 ${
          isLightTheme ? "border-slate-300" : "border-slate-600"
        }`}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
