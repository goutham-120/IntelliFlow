const fieldClass =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 outline-none transition focus:border-teal-300";
const secondaryButtonClass =
  "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800";
const primaryButtonClass =
  "rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:opacity-60";

const teamFields = [
  ["name", "Team Name"],
  ["code", "Team Code"],
];

export function TeamModal({
  description,
  descriptionPlaceholder,
  form,
  onClose,
  onSubmit,
  open,
  required,
  setForm,
  submitLabel,
  submitting,
  title,
}) {
  return (
    <ModalPanel open={open} maxWidth="max-w-lg" onClose={onClose}>
      <h3 className="font-['Baloo_2'] text-xl font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <TeamFields
          descriptionPlaceholder={descriptionPlaceholder}
          form={form}
          required={required}
          setForm={setForm}
        />
        <FormActions
          onCancel={onClose}
          submitting={submitting}
          submitLabel={submitLabel}
        />
      </form>
    </ModalPanel>
  );
}

export function MemberModal({
  availableUsers,
  form,
  onClose,
  onSubmit,
  open,
  setForm,
  submitting,
}) {
  return (
    <ModalPanel open={open} onClose={onClose}>
      <h3 className="font-['Baloo_2'] text-xl font-semibold text-white">
        Add Team Member
      </h3>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <select
          required
          value={form.userId}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, userId: event.target.value }))
          }
          className={fieldClass}
        >
          <option value="">Select user</option>
          {availableUsers.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        <select
          value={form.roleInGroup}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, roleInGroup: event.target.value }))
          }
          className={fieldClass}
        >
          <option value="member">member</option>
          <option value="team_lead">Team Lead</option>
        </select>
        <FormActions onCancel={onClose} submitting={submitting} submitLabel="Add Member" />
      </form>
    </ModalPanel>
  );
}

function TeamFields({
  form,
  required = false,
  setForm,
  descriptionPlaceholder = "Description (optional)",
}) {
  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      {teamFields.map(([key, placeholder]) => (
        <input
          key={key}
          type="text"
          placeholder={placeholder}
          required={required}
          value={form[key] || ""}
          onChange={(event) => updateField(key, event.target.value)}
          className={`${fieldClass} ${key === "code" ? "uppercase" : ""}`}
        />
      ))}
      <textarea
        placeholder={descriptionPlaceholder}
        rows={3}
        value={form.description || ""}
        onChange={(event) => updateField("description", event.target.value)}
        className={fieldClass}
      />
    </>
  );
}

function FormActions({ onCancel, submitting, submitLabel }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className={secondaryButtonClass}>
        Cancel
      </button>
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitLabel}
      </button>
    </div>
  );
}

function ModalPanel({ open, maxWidth = "max-w-md", onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-[2rem] border border-slate-700 bg-slate-950 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
