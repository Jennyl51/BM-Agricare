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
        <p style={{ margin: 0, color: "#667085", fontSize: 14 }}>{title}</p>
        <h2 style={{ margin: "10px 0 4px", fontSize: 30 }}>{value}</h2>
        {subtitle && <p style={{ margin: 0, color: "#667085", fontSize: 13 }}>{subtitle}</p>}
      </div>
    );
  }