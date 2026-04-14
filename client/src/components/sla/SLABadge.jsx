import { SLA_STATUS_META } from "../../utils/constants";

const toneClasses = {
  emerald: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  amber: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  rose: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  cyan: "border-cyan-400/40 bg-cyan-500/15 text-cyan-200",
};

export default function SLABadge({ status }) {
  const meta = SLA_STATUS_META[status] || {
    label: status || "Unknown",
    tone: "cyan",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[meta.tone]}`}>
      {meta.label}
    </span>
  );
}
