import { useNavigate } from "react-router"
import EmployeeForm from "./EmployeeForm.jsx"
import { useAuth } from "./AuthContext.jsx"

async function throwApiError(response, fallbackMessage) {
    if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.")
    }

    if (response.status === 403) {
        throw new Error(
            "You do not have permission to add employees."
        )
    }

    const result = await response.json().catch(() => ({}))

    const message =
        typeof result.detail === "string"
            ? result.detail
            : fallbackMessage

    throw new Error(message)
}

function AddEmployeePage() {
    const { token } = useAuth()
    const navigate = useNavigate()

    async function addEmployee(newEmployee) {
        const response = await fetch(
            "http://127.0.0.1:8000/employees/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newEmployee),
            }
        )

        if (!response.ok) {
            await throwApiError(
                response,
                "Failed to add employee."
            )
        }

        await response.json()

        navigate("/employees", { replace: true })
    }

    return (
        <section className="form-page">
            <div className="page-heading">
                <h2>Add employee</h2>
                <p>Create a new employee record.</p>
            </div>

            <EmployeeForm onAddEmployee={addEmployee} />

            <button
                className="secondary-button"
                type="button"
                onClick={() => navigate("/employees")}
            >
                Cancel
            </button>
        </section>
    )
}

export default AddEmployeePage