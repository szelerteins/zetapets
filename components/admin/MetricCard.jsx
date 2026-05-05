export default function MetricCard({ icon, label, value, sub, color = "verde", trend }) {
  return (
    <article className={`metric-card metric-card--${color}`}>
      <div className="metric-card-top">
        <span className="metric-icon">{icon}</span>
        {trend !== undefined && (
          <span className={`metric-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="metric-value">{value}</p>
      <p className="metric-label">{label}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </article>
  )
}
