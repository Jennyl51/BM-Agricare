export default function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="card">
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.88rem" }}>
        {title}
      </p>

      <h2 style={{ margin: "10px 0 4px", fontSize: "1.9rem" }}>{value}</h2>

      {subtitle && (
        <p
          style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}