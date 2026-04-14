import { useEffect, useMemo, useState } from "react";

import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import SLABadge from "../../components/sla/SLABadge";
import SLAStatsCards from "../../components/sla/SLAStatsCards";
import { fetchSlaDashboard } from "../../services/slaService";
import { formatDateTime, formatDurationHours } from "../../utils/formatDate";

const PAGE_SIZE = 8;

export default function SLADashboard() {
  const [data, setData] = useState({ summary: {}, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchSlaDashboard();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load SLA dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.records.slice(start, start + PAGE_SIZE);
  }, [data.records, page]);

  const totalPages = Math.max(1, Math.ceil((data.records.length || 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80">Service Health</p>
        <h1 className="mt-2 text-3xl font-bold text-white">SLA Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          SLA status is derived from task age so the page remains useful even before
          dedicated SLA policies are added to the backend.
        </p>
      </section>

      {loading ? <Loader label="Loading SLA metrics..." /> : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-rose-200">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <SLAStatsCards summary={data.summary} />

          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">At-Risk Task Monitor</h2>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm text-slate-300">
                <thead className="bg-slate-800/70 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Workflow</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record) => (
                    <tr key={record.taskId} className="border-t border-slate-800 hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-white">{record.title}</td>
                      <td className="px-4 py-3">{record.workflowName}</td>
                      <td className="px-4 py-3">{record.stageName}</td>
                      <td className="px-4 py-3">
                        <SLABadge status={record.status} />
                      </td>
                      <td className="px-4 py-3">{formatDurationHours(record.ageHours)}</td>
                      <td className="px-4 py-3">{record.assigneeName}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDateTime(record.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
