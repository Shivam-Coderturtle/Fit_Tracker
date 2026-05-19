import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const result =
      mode === 'signup'
        ? await onSignUp(username, password)
        : await onSignIn(username, password)

    if (result.error) setError(result.error)
    setSubmitting(false)
  }

  return (
    <div className="auth-screen">
      <div className="glow glow-a" aria-hidden />
      <div className="glow glow-b" aria-hidden />

      <div className="auth-card">
        <p className="eyebrow">FitTrack</p>
        <h1>{mode === 'signup' ? 'Create account' : 'Welcome back'}</h1>
        <p className="auth-sub">
          {mode === 'signup'
            ? 'Pick a unique username and password. Your data syncs to the cloud.'
            : 'Sign in with your username and password.'}
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              placeholder="e.g. priya_sharma"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        <p className="auth-hint">Usernames are unique across all FitTrack users (3–24 chars, a–z, 0–9, _).</p>
      </div>
    </div>
  )
}
