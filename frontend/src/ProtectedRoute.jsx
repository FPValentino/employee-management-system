import { Navigate, Outlet } from "react-router"
import { useAuth } from "./AuthContext.jsx"

function ProtectedRoute() {
    const { isLoading, isAuthenticated } = useAuth()

    if (isLoading) {
        return <p>Checking session...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute