export default function SLAStatsCards({ summary }) {
  const cards = [
    { label: "Tracked Tasks", value: summary?.total || 0, tone: "text-white" },
    { label: "On Track", value: summary?.on_track || 0, tone: "text-emerald-300" },
    { label: "Warning", value: summary?.warning || 0, tone: "text-amber-300" },
    { label: "Breached", value: summary?.breached || 0, tone: "text-rose-300" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5"
        >
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
        </article>
      ))}
    </div>
  );
}
