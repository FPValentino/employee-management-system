import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useAuth } from "./AuthContext.jsx"

function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    try {
      await login(email, password)
      navigate("/employees", { replace: true })
    } catch (caughtError) {
      setError(
        caughtError.message || "Unable to log in."
      )
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Employee Management System</h1>
        <h2>Sign in</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              minLength={8}
              required
            />
          </div>

          <button type="submit">Log in</button>

          {error && <p role="alert">{error}</p>}
        </form>

        <p className="auth-switch">
          Need an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginForm