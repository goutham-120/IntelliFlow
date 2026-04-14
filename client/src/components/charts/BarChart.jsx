import { CHART_COLORS } from "../../utils/constants";
import { useTheme } from "../../context/ThemeContext";

export default function BarChart({ data = [], title }) {
  const { isLightTheme } = useTheme();
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section
      className={`rounded-[28px] border p-5 shadow-sm ${
        isLightTheme
          ? "border-[#e8e8e4] bg-white"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <h3 className={`text-lg font-semibold ${isLightTheme ? "text-slate-900" : "text-white"}`}>
        {title}
      </h3>
      <div className="mt-5 space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div
              className={`flex items-center justify-between text-sm ${
                isLightTheme ? "text-slate-600" : "text-slate-300"
              }`}
            >
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className={`h-3 rounded-full ${isLightTheme ? "bg-slate-100" : "bg-slate-800"}`}>
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
