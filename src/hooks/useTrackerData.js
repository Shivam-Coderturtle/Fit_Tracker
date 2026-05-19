import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDateKey } from '../utils/dates'

function rowsToEntries(rows) {
  const entries = {}
  for (const row of rows) {
    entries[row.entry_date] = {
      weight: row.weight != null ? Number(row.weight) : undefined,
      dietFollowed: Boolean(row.diet_followed),
    }
  }
  return entries
}

export function useTrackerData(userId) {
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('daily_entries')
      .select('entry_date, weight, diet_followed')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setEntries({})
    } else {
      setEntries(rowsToEntries(data ?? []))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const saveToday = useCallback(
    async ({ weight, dietFollowed }) => {
      if (!userId) return { error: 'Not signed in' }

      const entryDate = toDateKey()
      const payload = {
        user_id: userId,
        entry_date: entryDate,
        diet_followed: dietFollowed,
        weight: typeof weight === 'number' ? weight : null,
        updated_at: new Date().toISOString(),
      }

      const { data, error: upsertError } = await supabase
        .from('daily_entries')
        .upsert(payload, { onConflict: 'user_id,entry_date' })
        .select('entry_date, weight, diet_followed')
        .single()

      if (upsertError) {
        return { error: upsertError.message }
      }

      setEntries((current) => ({
        ...current,
        [data.entry_date]: {
          weight: data.weight != null ? Number(data.weight) : undefined,
          dietFollowed: Boolean(data.diet_followed),
        },
      }))

      return { error: null }
    },
    [userId],
  )

  return { entries, loading, error, saveToday, refetch: fetchEntries }
}
