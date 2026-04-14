import { CHART_COLORS } from "../../utils/constants";

export default function LineChart({ data = [], title }) {
  const width = 360;
  const height = 180;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data
    .map((item, index) => {
      const x = stepX * index;
      const y = height - (item.value / maxValue) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full">
          <polyline
            fill="none"
            stroke={CHART_COLORS[1]}
            strokeWidth="3"
            points={points}
          />
          {data.map((item, index) => {
            const x = stepX * index;
            const y = height - (item.value / maxValue) * (height - 24) - 12;
            return (
              <g key={item.label}>
                <circle cx={x} cy={y} r="4" fill={CHART_COLORS[0]} />
                <text x={x} y={height - 2} textAnchor="middle" className="fill-slate-400 text-[10px]">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
