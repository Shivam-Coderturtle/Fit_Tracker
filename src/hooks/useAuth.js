import { useCallback, useEffect, useState } from 'react'
import {
  friendlyAuthError,
  getUsernameFromUser,
  normalizeUsername,
  usernameToEmail,
  validatePassword,
  validateUsername,
} from '../lib/auth'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setUsername(getUsernameFromUser(session?.user))
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUsername(getUsernameFromUser(session?.user))
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (rawUsername, password) => {
    const userError = validateUsername(rawUsername)
    if (userError) return { error: userError }

    const passError = validatePassword(password)
    if (passError) return { error: passError }

    const name = normalizeUsername(rawUsername)

    const { data: available, error: rpcError } = await supabase.rpc('is_username_available', {
      requested_username: name,
    })

    if (rpcError) {
      return { error: friendlyAuthError(rpcError.message) }
    }
    if (!available) {
      return { error: 'That username is already taken.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(name),
      password,
      options: {
        data: { username: name },
      },
    })

    if (error) {
      return { error: friendlyAuthError(error.message) }
    }

    if (data.user && !data.session) {
      return { error: 'Check your email to confirm — or disable email confirmation in Supabase.' }
    }

    return { error: null }
  }, [])

  const signIn = useCallback(async (rawUsername, password) => {
    const userError = validateUsername(rawUsername)
    if (userError) return { error: userError }

    const passError = validatePassword(password)
    if (passError) return { error: passError }

    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(rawUsername),
      password,
    })

    if (error) {
      return { error: friendlyAuthError(error.message) }
    }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, username, loading, signUp, signIn, signOut }
}
