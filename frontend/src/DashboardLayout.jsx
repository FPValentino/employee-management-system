import { NavLink, Outlet, useNavigate } from "react-router"
import Header from "./Header.jsx"
import Footer from "./Footer.jsx"
import { useAuth } from "./AuthContext.jsx"

function DashboardLayout() {
    const { currentUser, role, logout } = useAuth()
    const navigate = useNavigate()
    const isAdmin = role === "admin"

    function handleLogout() {
        logout()
        navigate("/login", { replace: true })
    }

    return (
        <div className="dashboard-shell">
            <aside className="dashboard-sidebar">
                <Header />

                <section className="sidebar-user">
                    <p>Signed in as:</p>
                    <strong>{currentUser?.email}</strong>

                    <p>
                        Role:{" "}
                        <span className={`role-badge role-${role}`}>
                            {role}
                        </span>
                    </p>
                </section>

                <nav
                    className="sidebar-navigation"
                    aria-label="Main navigation"
                >
                    <NavLink to="/employees" end>
                        Employees
                    </NavLink>

                    {isAdmin && (
                        <NavLink to="/employees/new">
                            Add employee
                        </NavLink>
                    )}
                </nav>

                <button
                    className="logout-button"
                    type="button"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </aside>

            <div className="dashboard-content">
                <main className="dashboard-main">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    )
}

export default DashboardLayout