import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => 
        localStorage.getItem("access_token")
    )
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const role = currentUser?.role ?? null
    const isAuthenticated = currentUser !== null

    useEffect(() => {
        async function restoreSession() {
            setIsLoading(true)

            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/auth/me', {
                    method: `GET`,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                })

                if (!response.ok) {
                    throw new Error("Unauthorized or token expired.")
                }

                const data = await response.json()
                setCurrentUser(data)
            } catch {
                localStorage.removeItem("access_token")
                setToken(null)
                setCurrentUser(null)
            } finally {
                setIsLoading(false)
            }
        }

    restoreSession()
    }, [token])

    async function login(email,password) {
        const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
            throw new Error("Invalid email or password.")
        }

        const data = await response.json()
        localStorage.setItem("access_token", data.access_token)
        setToken(data.access_token)
    }

    function logout() {
        localStorage.removeItem("access_token")
        setToken(null)
        setCurrentUser(null)
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider value={{
            token,
            currentUser,
            role,
            isAuthenticated,
            isLoading,
            login,
            logout,
        }}>
            {children}
            </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}