import { useEffect, useState, useRef } from "react";
import Loader from "../../components/common/Loader";
import { fetchAnalyticsDashboard } from "../../services/analyticsService";
import { formatDurationHours } from "../../utils/formatDate";
import {
  ClipboardList,
  CheckCircle2,
  Workflow,
  Users,
  UserRound,
} from "lucide-react";

const formatPercent = (v) => `${Number(v || 0).toFixed(1)}%`;

const STATUS_META = {
  pending:       { label: "Pending",       color: "#94a3b8" },
  in_progress:   { label: "In Progress",   color: "#38bdf8" },
  done:          { label: "Done",          color: "#34d399" },
  blocked:       { label: "Blocked",       color: "#fbbf24" },
  rejected:      { label: "Rejected",      color: "#f87171" },
  needs_changes: { label: "Needs Changes", color: "#a78bfa" },
};
const CHART_COLORS = ["#34d399","#38bdf8","#a78bfa","#fb923c","#f472b6","#fbbf24","#60a5fa","#2dd4bf"];
const statusLabel = (s) => STATUS_META[s]?.label || String(s||"Unknown").split("_").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const statusColor = (s) => STATUS_META[s]?.color || "#64748b";
const shortDate = (d) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};
const hoursToDisplay = (hours) => {
  const numeric = toNumber(hours);
  if (numeric === 0) return "0";
  return numeric < 24 ? `${numeric.toFixed(1)}h` : `${(numeric / 24).toFixed(1)}d`;
};

// ─── KPI Stat Cards ───────────────────────────────────────────────────────────
const STAT_DEFS = [
  { key:"totalTasks",     label:"Total Tasks",    icon:ClipboardList, bg:"bg-blue-500/20",    color:"text-blue-400"    },
  { key:"activeTasks",    label:"Active Tasks",   icon:CheckCircle2, bg:"bg-cyan-500/20",    color:"text-cyan-400"    },
  { key:"totalWorkflows", label:"Workflows",      icon:Workflow, bg:"bg-violet-500/20",  color:"text-violet-400"  },
  { key:"totalGroups",    label:"Groups",         icon:Users, bg:"bg-emerald-500/20", color:"text-emerald-400" },
  { key:"totalUsers",     label:"Users",          icon:UserRound, bg:"bg-orange-500/20",  color:"text-orange-400"  },
];

function StatCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {STAT_DEFS.map(({ key, label, icon, bg, color }) => (
        <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4">
          <div className={`mb-2 inline-flex rounded-xl p-2 sm:mb-3 sm:p-2.5 ${bg}`}>
            <span className={`text-lg sm:text-xl ${color}`}>{icon}</span>
          </div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{summary?.[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Canvas Line Chart ────────────────────────────────────────────────────────
function LineChart({ data, labels, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 300;
    const H = canvas.offsetHeight || 160;
    canvas.width = W; canvas.height = H;
    const pad = { top:16, right:12, bottom:28, left:36 };
    const cW = W-pad.left-pad.right, cH = H-pad.top-pad.bottom;
    const max = Math.max(...data)*1.2||10;
    ctx.clearRect(0,0,W,H);
    [0,0.25,0.5,0.75,1].forEach(frac=>{
      const y=pad.top+cH*frac;
      ctx.strokeStyle="rgba(148,163,184,0.1)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+cW,y); ctx.stroke();
      ctx.fillStyle="rgba(148,163,184,0.5)"; ctx.font="9px sans-serif"; ctx.textAlign="right";
      const val=max*(1-frac);
      ctx.fillText(val<1?val.toFixed(1):Math.round(val),pad.left-4,y+3);
    });
    const pts=data.map((v,i)=>({
      x:data.length===1?pad.left+cW/2:pad.left+(i/(data.length-1))*cW,
      y:pad.top+cH*(1-v/max),
    }));
    const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+cH);
    grad.addColorStop(0,color+"33"); grad.addColorStop(1,color+"00");
    ctx.beginPath();
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.lineTo(pts[pts.length-1].x,pad.top+cH); ctx.lineTo(pts[0].x,pad.top+cH); ctx.closePath();
    ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.lineJoin="round";
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
    pts.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2);
      ctx.fillStyle=color; ctx.fill();
      ctx.strokeStyle="#0f172a"; ctx.lineWidth=2; ctx.stroke();
    });
    const step=Math.ceil(labels.length/6);
    ctx.fillStyle="rgba(148,163,184,0.6)"; ctx.font="9px sans-serif"; ctx.textAlign="center";
    labels.forEach((l,i)=>{ if(i%step===0||i===labels.length-1) ctx.fillText(l,pts[i].x,H-4); });
  },[data,labels,color]);
  return <canvas ref={canvasRef} style={{width:"100%",height:"100%"}} />;
}

function ChartsRow({ tasksCreatedSeries = [], tasksCompletedSeries = [] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[
        { title:"Tasks Created Over Time", sub:"Daily count", data:tasksCreatedSeries.map(d=>toNumber(d.count)), labels:tasksCreatedSeries.map(d=>shortDate(d.date)), color:"#34d399" },
        { title:"Avg. Cycle Time", sub:"Hours from creation to stage completion", data:tasksCompletedSeries.map(d=>toNumber(d.avgCycleHours)), labels:tasksCompletedSeries.map(d=>shortDate(d.date)), color:"#a78bfa" },
      ].map(({title,sub,data,labels,color})=>(
        <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-white sm:text-sm">{title}</h3>
          <p className="mb-3 mt-0.5 text-xs text-slate-500">{sub}</p>
          <div style={{height:160}}><LineChart data={data} labels={labels} color={color} /></div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, total }) {
  const r=50,cx=70,cy=70,sw=18,circ=2*Math.PI*r;
  const slices=segments.reduce((acc,s)=>{
    const offset=acc.offset;
    const dash=(s.pct/100)*circ;
    return { offset:offset+dash, items:[...acc.items,{...s,dash,gap:circ-dash,offset}] };
  },{ offset:0, items:[] }).items;
  return (
    <svg width={cx*2} height={cy*2} viewBox={`0 0 ${cx*2} ${cy*2}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={sw}/>
      {slices.map(s=>(
        <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw}
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-(s.offset-circ/4)} strokeLinecap="butt"/>
      ))}
      <text x={cx} y={cy-4} textAnchor="middle" fill="white" fontSize={18} fontWeight="bold">{total}</text>
      <text x={cx} y={cy+13} textAnchor="middle" fill="#94a3b8" fontSize={9}>Total</text>
    </svg>
  );
}

function TasksByStatusCard({ taskStatusData = [] }) {
  const total=taskStatusData.reduce((s,e)=>s+toNumber(e.value),0);
  const segments=taskStatusData.map(e=>({label:e.label,color:statusColor(e.label),pct:total>0?(toNumber(e.value)/total)*100:0,count:toNumber(e.value)}));
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-semibold text-white sm:mb-4 sm:text-sm">Tasks by Status</h3>
      {!segments.length ? <p className="text-xs text-slate-500">No data yet.</p> : (
        <div className="flex flex-wrap items-center gap-4">
          <DonutChart segments={segments} total={total}/>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {segments.map(s=>(
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5" style={{background:s.color}}/>
                <span className="text-slate-300">{statusLabel(s.label)}</span>
                <span className="ml-auto pl-2 font-semibold text-white">{s.count}</span>
                <span className="text-slate-500">({s.pct.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TasksByWorkflowCard({ workflowMixData = [] }) {
  const total=workflowMixData.reduce((s,e)=>s+toNumber(e.value),0);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-semibold text-white sm:mb-4 sm:text-sm">Tasks by Workflow</h3>
      {!workflowMixData.length ? <p className="text-xs text-slate-500">No data yet.</p> : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {workflowMixData.map((w,i)=>{
            const value = toNumber(w.value);
            const pct=total>0?(value/total)*100:0;
            const color=CHART_COLORS[i%CHART_COLORS.length];
            return (
              <div key={w.label} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:gap-3">
                <div>
                  <p className="mb-1 truncate text-xs text-slate-300">{w.label}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800 sm:h-2">
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:color}}/>
                  </div>
                </div>
                <span className="text-xs font-semibold text-white whitespace-nowrap">
                  {value} <span className="font-normal text-slate-500">({pct.toFixed(1)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Bottleneck Table ─────────────────────────────────────────────────────────
const IMPACT_COLORS = { High:"bg-rose-500/20 text-rose-300", Medium:"bg-amber-500/20 text-amber-300", Low:"bg-emerald-500/20 text-emerald-300" };
const waitImpact = (h) => { const d=toNumber(h)/24; return d>=1.5?"High":d>=0.75?"Medium":"Low"; };

function BottleneckTable({ bottleneckStages = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h3 className="text-xs font-semibold text-white sm:text-sm">Top Bottleneck Stages</h3>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs uppercase tracking-widest text-slate-400 sm:px-3 sm:py-1">By Wait Time</span>
      </div>
      {!bottleneckStages?.length ? (
        <p className="text-xs text-slate-500">No bottleneck data yet — stages appear once tasks start completing.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wide">
                <th className="pb-2 pr-3 font-medium">Stage</th>
                <th className="pb-2 pr-3 font-medium">Workflow</th>
                <th className="pb-2 pr-3 font-medium">Avg. Wait</th>
                <th className="pb-2 pr-3 font-medium">Tasks</th>
                <th className="pb-2 font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {bottleneckStages.map((row,i)=>{
                const impact=waitImpact(row.avgWaitHours);
                return (
                  <tr key={`${row.stageName}-${i}`} className="border-t border-slate-800/60">
                    <td className="py-2 pr-3"><span className="inline-flex items-center gap-1.5 text-slate-200"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400"/>{row.stageName}</span></td>
                    <td className="py-2 pr-3 text-slate-400">{row.workflowName}</td>
                    <td className="py-2 pr-3 text-slate-300">{hoursToDisplay(row.avgWaitHours)}</td>
                    <td className="py-2 pr-3 text-slate-400">{toNumber(row.taskCount)}</td>
                    <td className="py-2"><span className={`rounded px-1.5 py-0.5 text-xs font-medium ${IMPACT_COLORS[impact]}`}>{impact}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Workflow Status Cards ────────────────────────────────────────────────────
function WorkflowStatusCards({ workflowStatusCards = [] }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-white sm:text-sm">Workflow Task Status</h3>
          <p className="mt-0.5 text-xs text-slate-400">Tasks per workflow and their current status.</p>
        </div>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs uppercase tracking-widest text-slate-400 sm:px-3 sm:py-1">By Workflow</span>
      </div>
      {!workflowStatusCards?.length ? (
        <p className="text-xs text-slate-500">No workflow data yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {workflowStatusCards.map((workflow)=>(
            <article key={String(workflow.workflowId)} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-xs font-semibold text-white sm:text-sm">{workflow.name}</h4>
                  <p className="mt-0.5 text-xs text-slate-400">{workflow.totalTasks} {workflow.totalTasks===1?"task":"tasks"}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs sm:px-2.5 sm:py-1 ${workflow.isActive?"border-emerald-400/40 bg-emerald-400/10 text-emerald-300":"border-slate-600 bg-slate-800/70 text-slate-300"}`}>
                  {workflow.isActive?"Active":"Inactive"}
                </span>
              </div>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-slate-800 sm:mt-4 sm:h-2">
                {(workflow.statuses||[]).filter(e=>e.count>0).map(entry=>(
                  <span key={entry.status} className="inline-block h-full" style={{width:`${(entry.count/workflow.totalTasks)*100}%`,background:statusColor(entry.status)}}/>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2">
                {(workflow.statuses||[]).filter(e=>e.count>0).map(entry=>(
                  <div key={entry.status} className="flex items-center justify-between gap-1 rounded-lg border border-slate-800 bg-slate-900/55 px-2 py-1.5 sm:rounded-xl sm:px-3">
                    <span className="flex min-w-0 items-center gap-1 truncate text-xs text-slate-400">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{background:statusColor(entry.status)}}/>
                      {statusLabel(entry.status)}
                    </span>
                    <span className="text-xs font-semibold text-white sm:text-sm">{entry.count}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Performance Table ────────────────────────────────────────────────────────
function PerformanceTable({ title, rows = [] }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h3 className="text-xs font-semibold text-white sm:text-sm">{title}</h3>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs uppercase tracking-widest text-slate-400 sm:px-3 sm:py-1">Ranked</span>
      </div>
      {!rows?.length ? (
        <p className="text-xs text-slate-500">No performance data yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[600px] text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="pb-2 pr-3 font-medium">Name</th>
                <th className="pb-2 pr-3 font-medium">Total</th>
                <th className="pb-2 pr-3 font-medium">Done</th>
                <th className="pb-2 pr-3 font-medium">Active</th>
                <th className="pb-2 pr-3 font-medium">Blocked</th>
                <th className="pb-2 pr-3 font-medium">Rate</th>
                <th className="pb-2 font-medium">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row=>(
                <tr key={row.name} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-2.5 pr-3 font-medium text-white">{row.name}</td>
                  <td className="py-2.5 pr-3">{toNumber(row.totalTasks)}</td>
                  <td className="py-2.5 pr-3 text-emerald-400">{toNumber(row.completedTasks)}</td>
                  <td className="py-2.5 pr-3 text-cyan-400">{toNumber(row.activeTasks)}</td>
                  <td className="py-2.5 pr-3 text-amber-400">{toNumber(row.blockedTasks)}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-800 sm:w-20">
                        <div className="h-full rounded-full bg-emerald-400" style={{width:`${row.completionRate}%`}}/>
                      </div>
                      <span>{formatPercent(row.completionRate)}</span>
                    </div>
                  </td>
                  <td className="py-2.5">{formatDurationHours(row.avgCompletionHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try { setData(await fetchAnalyticsDashboard()); }
      catch (err) { setError(err.response?.data?.message || "Failed to load analytics"); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">Analytics</h1>
        <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">Track performance, identify bottlenecks and gain actionable insights.</p>
      </div>

      {loading && <Loader label="Loading analytics..." />}
      {error && <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-sm text-rose-200">{error}</div>}

      {data && (
        <div className="space-y-4 sm:space-y-5">
          <StatCards summary={data.summary} />
          <ChartsRow tasksCreatedSeries={data.tasksCreatedSeries} tasksCompletedSeries={data.tasksCompletedSeries} />
          <div className="grid gap-4 lg:grid-cols-2">
            <TasksByStatusCard taskStatusData={data.taskStatusData} />
            <TasksByWorkflowCard workflowMixData={data.workflowMixData} />
          </div>
          <BottleneckTable bottleneckStages={data.bottleneckStages} />
          <WorkflowStatusCards workflowStatusCards={data.workflowStatusCards} />
          <PerformanceTable title="Team Performance" rows={data.teamPerformance} />
          {/* <PerformanceTable title="Employee Performance" rows={data.employeePerformance} /> */}
        </div>
      )}
    </div>
  );
}
