import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function ChartTooltip({ active, payload, label, extraLabel }) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  const weight = point?.weight

  return (
    <div className="chart-tooltip">
      <strong>{extraLabel ? point?.range ?? label : label}</strong>
      {weight != null ? (
        <p>
          {extraLabel ? 'Avg weight' : 'Weight'}: <span>{weight.toFixed(1)} kg</span>
        </p>
      ) : (
        <p className="muted">No weight logged</p>
      )}
      {typeof point?.dietDays === 'number' && (
        <p>
          Diet on plan: <span>{point.dietDays}/7 days</span>
        </p>
      )}
      {typeof point?.dietFollowed === 'boolean' && (
        <p>
          Diet today: <span>{point.dietFollowed ? 'Yes' : 'No'}</span>
        </p>
      )}
    </div>
  )
}

export default function WeightChart({ title, subtitle, data, xKey = 'label', weekMode = false, gradientId = 'weightLine' }) {
  const values = data.map((d) => d.weight).filter((v) => v != null)
  const min = values.length ? Math.min(...values) - 1 : 60
  const max = values.length ? Math.max(...values) + 1 : 80

  return (
    <article className="chart-card">
      <header className="chart-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              content={<ChartTooltip extraLabel={weekMode} />}
              cursor={{ stroke: 'rgba(52, 211, 153, 0.35)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={`url(#${gradientId})`}
              strokeWidth={3}
              dot={{ r: 5, fill: '#0f172a', stroke: '#34d399', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#34d399', stroke: '#ecfdf5', strokeWidth: 2 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {values.length === 0 && (
        <p className="chart-empty">Log your weight to see your trend line.</p>
      )}
    </article>
  )
}
