import AuthScreen from './components/AuthScreen'
import TrackerApp from './components/TrackerApp'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { user, username, loading, signUp, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="app loading-screen">
        <p>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <TrackerApp
      userId={user.id}
      username={username ?? 'user'}
      onSignOut={signOut}
    />
  )
}

export default App
