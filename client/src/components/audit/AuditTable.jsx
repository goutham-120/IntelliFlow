import { formatDateTime } from "../../utils/formatDate";

export default function AuditTable({ entries = [] }) {
  return (
    <div className="overflow-x-auto rounded-[30px] border border-slate-700/80 bg-slate-950/72 shadow-[0_18px_45px_rgba(2,6,23,0.24)] backdrop-blur-xl">
      <table className="w-full min-w-[760px] text-left text-sm text-slate-200">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Entity</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-t border-slate-800 hover:bg-white/5">
              <td className="px-4 py-3 text-slate-400">{formatDateTime(entry.createdAt)}</td>
              <td className="px-4 py-3 capitalize text-white">{entry.action.replaceAll("_", " ")}</td>
              <td className="px-4 py-3 capitalize">{entry.entityType}</td>
              <td className="px-4 py-3">{entry.actor || "System"}</td>
              <td className="px-4 py-3 text-slate-300">{entry.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
