export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 disabled:opacity-50"
      >
        Prev
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          className={`rounded-xl px-3 py-2 text-sm ${
            item === page
              ? "bg-teal-400 font-semibold text-slate-950"
              : "border border-slate-700 bg-slate-950/70 text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-900 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
