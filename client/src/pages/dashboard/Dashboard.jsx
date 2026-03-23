export default function Dashboard() {
  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold text-white">
        Dashboard Overview
      </h1>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPI title="Active Tasks" value="24" />
        <KPI title="Pending Approvals" value="8" />
        <KPI title="SLA Breaches" value="2" />
        <KPI title="Avg Completion" value="3.2d" />
      </div>

      {/* Placeholder Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Task Distribution" />
        <Card title="Workflow Bottlenecks" />
      </div>

      <Card title="Recent Activity" />
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-950/40 border border-slate-700/60 backdrop-blur-xl shadow-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="text-2xl font-bold text-emerald-400 mt-2">{value}</h2>
    </div>
  );
}

function Card({ title }) {
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-950/40 border border-slate-700/60 backdrop-blur-xl shadow-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <p className="text-slate-400 text-sm">Module coming soon...</p>
    </div>
  );
}