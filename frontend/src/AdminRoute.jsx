import { Navigate, Outlet } from "react-router"
import { useAuth } from "./AuthContext.jsx"

function AdminRoute() {
    const { role } = useAuth()

    if (role !== "admin") {
        return <Navigate to="/employees" replace />
    }

    return <Outlet />
}

export default AdminRoute