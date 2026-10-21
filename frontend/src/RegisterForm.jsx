import { useState } from "react"
import { Link, useNavigate } from "react-router"

function RegisterForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          typeof result.detail === "string"
            ? result.detail
            : "Registration failed."

        throw new Error(message)
      }

      navigate("/login", { replace: true })
    } catch (caughtError) {
      setError(
        caughtError.message || "Unable to register."
      )
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Employee Management System</h1>
        <h2>Create an account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button type="submit">Create account</button>

          {error && <p role="alert">{error}</p>}
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterForm