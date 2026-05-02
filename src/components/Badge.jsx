const MAP = {
  pending:   { cls: 'badge-pending',   label: '⏳ Pending' },
  confirmed: { cls: 'badge-confirmed', label: '✅ Confirmed' },
  completed: { cls: 'badge-completed', label: '✔ Completed' },
  cancelled: { cls: 'badge-cancelled', label: '✕ Cancelled' },
  patient:   { cls: 'badge-patient',   label: 'Patient' },
  doctor:    { cls: 'badge-doctor',    label: 'Doctor' },
  admin:     { cls: 'badge-admin',     label: 'Admin' },
};

export default function Badge({ value, label }) {
  const m = MAP[value] || { cls: 'badge-pending', label: value };
  return <span className={`badge ${m.cls}`}>{label || m.label}</span>;
}
