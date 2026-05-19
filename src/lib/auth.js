const USERNAME_RE = /^[a-z0-9_]{3,24}$/

export function normalizeUsername(raw) {
  return raw.trim().toLowerCase()
}

export function validateUsername(raw) {
  const username = normalizeUsername(raw)
  if (!USERNAME_RE.test(username)) {
    return 'Username: 3–24 characters, letters, numbers, and underscores only.'
  }
  return null
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters.'
  }
  return null
}

/** Supabase Auth requires email; username maps to a private synthetic address. */
export function usernameToEmail(username) {
  return `${normalizeUsername(username)}@fittrack.app`
}

export function getUsernameFromUser(user) {
  return user?.user_metadata?.username ?? null
}

export function friendlyAuthError(message) {
  if (!message) return 'Something went wrong. Try again.'
  if (message.includes('Invalid login credentials')) {
    return 'Wrong username or password.'
  }
  if (message.includes('User already registered')) {
    return 'That username is already taken.'
  }
  if (message.includes('profiles_username_unique')) {
    return 'That username is already taken.'
  }
  return message
}
