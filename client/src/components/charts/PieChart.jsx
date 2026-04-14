import { CHART_COLORS } from "../../utils/constants";

const buildSlices = (data, radius) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let cumulative = 0;

  return data.map((item, index) => {
    const startAngle = (cumulative / total) * Math.PI * 2;
    cumulative += item.value;
    const endAngle = (cumulative / total) * Math.PI * 2;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = 100 + radius * Math.cos(startAngle);
    const y1 = 100 + radius * Math.sin(startAngle);
    const x2 = 100 + radius * Math.cos(endAngle);
    const y2 = 100 + radius * Math.sin(endAngle);

    const path = [
      "M 100 100",
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return {
      ...item,
      path,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });
};

export default function PieChart({ data = [], title }) {
  const slices = buildSlices(data, 72);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
        <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56">
          {slices.map((slice) => (
            <path key={slice.label} d={slice.path} fill={slice.color} stroke="#0f172a" strokeWidth="2" />
          ))}
          <circle cx="100" cy="100" r="28" fill="#020617" />
        </svg>
        <div className="space-y-3">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span>{slice.label}</span>
              </div>
              <span className="font-medium text-white">{slice.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
