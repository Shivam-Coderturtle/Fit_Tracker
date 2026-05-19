export function toDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function formatShort(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
}

export function formatWeekRange(start, end) {
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

export function lastNDays(n, from = new Date()) {
  const days = []
  for (let i = n - 1; i >= 0; i -= 1) {
    days.push(addDays(from, -i))
  }
  return days
}
