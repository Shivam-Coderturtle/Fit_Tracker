import { addDays, formatShort, formatWeekRange, lastNDays, parseDateKey, toDateKey } from './dates'

export function getEntry(entries, dateKey) {
  return entries[dateKey] ?? null
}

export function computeDietStreak(entries, todayKey = toDateKey()) {
  let streak = 0
  let cursor = parseDateKey(todayKey)

  const today = entries[todayKey]
  if (!today?.dietFollowed) {
    cursor = addDays(cursor, -1)
  }

  while (true) {
    const key = toDateKey(cursor)
    if (!entries[key]?.dietFollowed) break
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export function dietCountInRange(entries, days) {
  return days.filter((day) => entries[toDateKey(day)]?.dietFollowed).length
}

export function buildSevenDaySeries(entries, from = new Date()) {
  const days = lastNDays(7, from)
  return days.map((day) => {
    const key = toDateKey(day)
    const entry = entries[key]
    return {
      key,
      label: formatShort(day),
      weight: entry?.weight ?? null,
      dietFollowed: Boolean(entry?.dietFollowed),
    }
  })
}

export function buildFourWeekSeries(entries, from = new Date()) {
  const weeks = []
  for (let w = 3; w >= 0; w -= 1) {
    const weekEnd = addDays(from, -w * 7)
    const weekStart = addDays(weekEnd, -6)
    const days = lastNDays(7, weekEnd)

    const weights = days
      .map((day) => entries[toDateKey(day)]?.weight)
      .filter((value) => typeof value === 'number')

    const dietDays = days.filter((day) => entries[toDateKey(day)]?.dietFollowed).length

    weeks.push({
      key: `week-${w}`,
      label: `Week ${4 - w}`,
      range: formatWeekRange(weekStart, weekEnd),
      weight: weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : null,
      dietDays,
      loggedDays: weights.length,
    })
  }
  return weeks
}

export function weightDelta(series) {
  const values = series.map((point) => point.weight).filter((v) => v != null)
  if (values.length < 2) return null
  return values[values.length - 1] - values[0]
}

export function latestWeight(entries) {
  const keys = Object.keys(entries).sort()
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    const weight = entries[keys[i]]?.weight
    if (typeof weight === 'number') return { key: keys[i], weight }
  }
  return null
}

export function sortedHistory(entries, limit = 14) {
  return Object.entries(entries)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limit)
    .map(([key, value]) => ({ key, ...value }))
}
