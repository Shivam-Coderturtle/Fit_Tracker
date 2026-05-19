import { useEffect, useMemo, useState } from 'react'
import WeightChart from './WeightChart'
import { useTrackerData } from '../hooks/useTrackerData'
import { lastNDays, parseDateKey, toDateKey } from '../utils/dates'
import {
  buildFourWeekSeries,
  buildSevenDaySeries,
  computeDietStreak,
  dietCountInRange,
  latestWeight,
  sortedHistory,
  weightDelta,
} from '../utils/tracker'

function formatDelta(kg) {
  if (kg == null) return '—'
  const sign = kg > 0 ? '+' : ''
  return `${sign}${kg.toFixed(1)} kg`
}

export default function TrackerApp({ username, userId, onSignOut }) {
  const { entries, loading, error, saveToday } = useTrackerData(userId)
  const todayKey = toDateKey()
  const todayEntry = entries[todayKey]

  const [weightInput, setWeightInput] = useState('')
  const [dietFollowed, setDietFollowed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setWeightInput(
      typeof todayEntry?.weight === 'number' ? String(todayEntry.weight) : '',
    )
    setDietFollowed(Boolean(todayEntry?.dietFollowed))
  }, [todayKey, todayEntry?.weight, todayEntry?.dietFollowed])

  const savedWeightStr =
    typeof todayEntry?.weight === 'number' ? String(todayEntry.weight) : ''
  const savedDiet = Boolean(todayEntry?.dietFollowed)
  const hasLoggedToday = Boolean(todayEntry)
  const formMatchesSaved =
    weightInput === savedWeightStr && dietFollowed === savedDiet
  const isSavedForToday = hasLoggedToday && formMatchesSaved && !saving

  const sevenDay = useMemo(() => buildSevenDaySeries(entries), [entries])
  const fourWeeks = useMemo(() => buildFourWeekSeries(entries), [entries])
  const streak = useMemo(() => computeDietStreak(entries, todayKey), [entries, todayKey])
  const dietThisWeek = useMemo(
    () => dietCountInRange(entries, lastNDays(7)),
    [entries],
  )
  const delta7 = useMemo(() => weightDelta(sevenDay), [sevenDay])
  const latest = useMemo(() => latestWeight(entries), [entries])
  const history = useMemo(() => sortedHistory(entries), [entries])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError('')

    const parsed = weightInput.trim() === '' ? undefined : Number(weightInput)
    if (parsed !== undefined && (Number.isNaN(parsed) || parsed <= 0 || parsed > 500)) {
      setSaveError('Enter a valid weight between 1 and 500 kg.')
      return
    }

    setSaving(true)
    const { error: err } = await saveToday({ weight: parsed, dietFollowed })
    setSaving(false)

    if (err) {
      setSaveError(err)
    }
  }

  if (loading) {
    return (
      <div className="app loading-screen">
        <p>Loading your progress…</p>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="glow glow-a" aria-hidden />
      <div className="glow glow-b" aria-hidden />

      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">Your daily momentum</p>
          <h1>FitTrack</h1>
          <p className="tagline">Hi, <strong>@{username}</strong> — log weight, own your diet.</p>
        </div>
        <div className="hero-actions">
          {latest && (
            <div className="hero-stat">
              <span>Latest</span>
              <strong>{latest.weight.toFixed(1)}</strong>
              <small>kg</small>
            </div>
          )}
          <button type="button" className="btn-ghost" onClick={onSignOut}>
            Log out
          </button>
        </div>
      </header>

      {error && (
        <p className="banner-error" role="alert">
          Could not load data: {error}. Check that database tables are set up in Supabase.
        </p>
      )}

      <section className="stats-row">
        <article className="stat-card streak">
          <span className="stat-label">Diet streak</span>
          <strong>{streak}</strong>
          <small>{streak === 1 ? 'day on plan' : 'days on plan'}</small>
        </article>
        <article className="stat-card">
          <span className="stat-label">Diet this week</span>
          <strong>{dietThisWeek}/7</strong>
          <small>days followed</small>
        </article>
        <article className="stat-card">
          <span className="stat-label">7-day change</span>
          <strong className={delta7 != null && delta7 < 0 ? 'positive' : delta7 > 0 ? 'warn' : ''}>
            {formatDelta(delta7)}
          </strong>
          <small>weight trend</small>
        </article>
      </section>

      <section className="panel today-panel">
        <h2>Today</h2>
        <p className="panel-note">
          {parseDateKey(todayKey).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <form className="today-form" onSubmit={handleSave}>
          <label className="field">
            <span>Weight (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="1"
              max="500"
              placeholder="e.g. 72.4"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
          </label>

          <label className={`diet-toggle ${dietFollowed ? 'on' : ''}`}>
            <input
              type="checkbox"
              checked={dietFollowed}
              onChange={(e) => setDietFollowed(e.target.checked)}
            />
            <span className="diet-check" aria-hidden />
            <span className="diet-copy">
              <strong>I followed my diet today</strong>
              <small>Mark complete when you stayed on plan</small>
            </span>
          </label>

          {saveError && (
            <p className="auth-error" role="alert">
              {saveError}
            </p>
          )}

          <button
            type="submit"
            className={`btn-primary ${isSavedForToday ? 'btn-saved' : ''}`}
            disabled={isSavedForToday || saving}
          >
            {saving
              ? 'Saving…'
              : isSavedForToday
                ? 'Saved for today ✓'
                : hasLoggedToday
                  ? 'Update today'
                  : 'Save today'}
          </button>
        </form>

        {isSavedForToday && (
          <p className="toast" role="status">
            Today is logged. Change weight or diet to update.
          </p>
        )}
      </section>

      <section className="charts">
        <WeightChart title="Last 7 days" subtitle="Day-by-day weight (kg)" data={sevenDay} />
        <WeightChart
          title="Last 4 weeks"
          subtitle="Weekly average weight (kg)"
          data={fourWeeks}
          weekMode
          gradientId="weightLineWeeks"
        />
      </section>

      <section className="panel history-panel">
        <h2>Recent log</h2>
        {history.length === 0 ? (
          <p className="empty">No entries yet. Save today to start your graph.</p>
        ) : (
          <ul className="history-list">
            {history.map((row) => (
              <li key={row.key}>
                <div>
                  <strong>
                    {parseDateKey(row.key).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </strong>
                  <p>
                    {typeof row.weight === 'number' ? `${row.weight.toFixed(1)} kg` : 'No weight'}
                  </p>
                </div>
                <span className={`badge ${row.dietFollowed ? 'ok' : 'miss'}`}>
                  {row.dietFollowed ? 'Diet ✓' : 'Diet —'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        <p>
          Data is stored in <strong>Supabase</strong> (cloud) under your account. Log in on any
          device with the same username.
        </p>
      </footer>
    </div>
  )
}
