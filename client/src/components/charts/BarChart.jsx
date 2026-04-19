import { CHART_COLORS } from "../../utils/constants";
import { useTheme } from "../../context/ThemeContext";

export default function BarChart({ data = [], title }) {
  const { isLightTheme } = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const useDarkCard = isLightTheme;

  return (
    <section
      className={`rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(2,6,23,0.24)] ${
        useDarkCard
          ? "border-slate-800/90 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.8))]"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <h3 className={`text-lg font-semibold ${useDarkCard ? "text-white" : "text-white"}`}>
        {title}
      </h3>
      <div className="mt-5 space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div
              className={`flex items-center justify-between text-sm ${
                useDarkCard ? "text-slate-300" : "text-slate-300"
              }`}
            >
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className={`h-3 rounded-full ${useDarkCard ? "bg-slate-800" : "bg-slate-800"}`}>
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
