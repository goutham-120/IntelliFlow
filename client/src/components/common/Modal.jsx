export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer = null,
  size = "md",
}) {
  if (!open) return null;

  const widthClass =
    size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-md" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 p-4">
      <div className={`w-full ${widthClass} rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-800 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
