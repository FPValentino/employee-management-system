import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import EmployeeEditForm from "./EmployeeEditForm.jsx"
import { useAuth } from "./AuthContext.jsx"

async function throwApiError(response, fallbackMessage) {
    if (response.status === 401) {
        throw new Error(
            "Your session has expired. Please log in again."
        )
    }

    if (response.status === 403) {
        throw new Error(
            "You do not have permission to edit employees."
        )
    }

    const result = await response.json().catch(() => ({}))

    const message =
        typeof result.detail === "string"
            ? result.detail
            : fallbackMessage

    throw new Error(message)
}

function EditEmployeePage() {
    const { employeeId } = useParams()
    const { token } = useAuth()
    const navigate = useNavigate()

    const [employee, setEmployee] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchEmployee() {
            setIsLoading(true)
            setError("")

            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/employees/${employeeId}`,
                    {
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    await throwApiError(
                        response,
                        "Unable to load employee."
                    )
                }

                const data = await response.json()
                setEmployee(data)
            } catch (caughtError) {
                setError(caughtError.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEmployee()
    }, [employeeId, token])

    async function updateEmployee(updatedEmployee) {
        const response = await fetch(
            `http://127.0.0.1:8000/employees/${employeeId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedEmployee),
            }
        )

        if (!response.ok) {
            await throwApiError(
                response,
                "Failed to update employee."
            )
        }

        await response.json()

        navigate("/employees", { replace: true })
    }

    if (isLoading) {
        return (
            <section className="form-page">
                <p>Loading employee...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="form-page">
                <p role="alert">{error}</p>

                <button
                    type="button"
                    onClick={() => navigate("/employees")}
                >
                    Back to employees
                </button>
            </section>
        )
    }

    if (!employee) {
        return (
            <section className="form-page">
                <p>Employee not found.</p>

                <button
                    type="button"
                    onClick={() => navigate("/employees")}
                >
                    Back to employees
                </button>
            </section>
        )
    }

    return (
        <section className="form-page">
            <div className="page-heading">
                <h2>Edit employee</h2>
                <p>
                    Update the information for{" "}
                    <strong>
                        {employee.first_name}{" "}
                        {employee.last_name}
                    </strong>
                    .
                </p>
            </div>

            <EmployeeEditForm
                employee={employee}
                onSave={updateEmployee}
                onCancel={() => navigate("/employees")}
            />
        </section>
    )
}

export default EditEmployeePage