import { useEffect, useMemo, useState } from "react";

import AuditTable from "../../components/audit/AuditTable";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { fetchAuditLogs } from "../../services/auditService";

const PAGE_SIZE = 10;

export default function AuditLogs() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchAuditLogs();
        setEntries(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load audit timeline");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return entries.slice(start, start + PAGE_SIZE);
  }, [entries, page]);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-300/80">Traceability</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Audit Timeline</h1>
        <p className="mt-2 text-sm text-slate-400">
          This view synthesizes the important operational events already visible from the
          current app data so you can inspect activity without dead placeholder screens.
        </p>
      </section>

      {loading ? <Loader label="Loading audit timeline..." /> : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 p-4 text-rose-200">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <section className="space-y-4">
          <div className="flex justify-end">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
          <AuditTable entries={pageItems} />
        </section>
      ) : null}
    </div>
  );
}
