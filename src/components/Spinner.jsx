export function Spinner() {
  return <span className="spinner" />;
}

export function PageLoading() {
  return (
    <div className="page-loading">
      <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Loading...</span>
    </div>
  );
}
