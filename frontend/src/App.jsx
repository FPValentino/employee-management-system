import { Navigate, Route, Routes } from "react-router"
import LoginForm from "./LoginForm.jsx"
import RegisterForm from "./RegisterForm.jsx"
import EmployeePage from "./EmployeePage.jsx"
import EditEmployeePage from "./EditEmployeePage.jsx"
import AddEmployeePage from "./AddEmployeePage.jsx"
import DashboardLayout from "./DashboardLayout.jsx"
import ProtectedRoute from "./ProtectedRoute.jsx"
import AdminRoute from "./AdminRoute.jsx"

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/employees"
                    element={<DashboardLayout />}
                >
                    <Route index element={<EmployeePage />} />

                    <Route element={<AdminRoute />}>
                        <Route
                            path=":employeeId/edit"
                            element={<EditEmployeePage />}
                        />
                        
                        <Route
                            path="new"
                            element={<AddEmployeePage />}
                        />
                    </Route>
                </Route>
            </Route>

            <Route
                path="*"
                element={<Navigate to="/employees" replace />}
            />
        </Routes>
    )
}

export default App