import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import EmployeeList from "./EmployeeList.jsx"
import EmployeeSummary from "./EmployeeSummary.jsx"
import { useAuth } from "./AuthContext.jsx"
import "./App.css"

function getApiError(response, fallbackMessage) {
    if (response.status === 401) {
        return new Error("Your session has expired. Please log in again.")
    }

    if (response.status === 403) {
        return new Error("You do not have permission to perform this action.")
    }

    return new Error(fallbackMessage)
}

function EmployeePage() {
    const [employees, setEmployees] = useState([])
    const [allEmployees, setAllEmployees] = useState([])
    const [refreshKey, setRefreshKey] = useState(0)

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [actionError, setActionError] = useState("")

    const [search, setSearch] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    const navigate = useNavigate()
    const { role, token } = useAuth()

    const isAdmin = role === "admin"

    const hasActiveFilters =
        search.trim() !== "" ||
        departmentFilter !== "" ||
        statusFilter !== ""

    const totalEmployees = allEmployees.length

    const activeEmployees = allEmployees.filter(
        (employee) => employee.status
    ).length

    const inactiveEmployees = allEmployees.filter(
        (employee) => !employee.status
    ).length

    const departmentCount = new Set(
        allEmployees.map((employee) => employee.department)
    ).size

    useEffect(() => {
        async function fetchEmployees() {
            setIsLoading(true)
            setError("")

            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                const params = new URLSearchParams()

                if (search.trim()) {
                    params.set("search", search.trim())
                }

                if (departmentFilter) {
                    params.set("department", departmentFilter)
                }

                if (statusFilter) {
                    params.set("status", statusFilter)
                }

                const response = await fetch(
                    `http://127.0.0.1:8000/employees/?${params.toString()}`,
                    {
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw getApiError(
                        response,
                        "Failed to fetch employees."
                    )
                }

                const data = await response.json()
                setEmployees(data)
            } catch (caughtError) {
                setError(caughtError.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchEmployees()
    }, [
        token,
        refreshKey,
        search,
        departmentFilter,
        statusFilter,
    ])

    useEffect(() => {
        async function fetchAllEmployees() {
            if (!token) {
                return
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/employees/",
                    {
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw getApiError(
                        response,
                        "Unable to fetch employee records."
                    )
                }

                const data = await response.json()
                setAllEmployees(data)
            } catch (caughtError) {
                setError(caughtError.message)
            }
        }

        fetchAllEmployees()
    }, [token, refreshKey])

    async function updateEmployeeStatus(employeeId) {
        setActionError("")

        const employee = employees.find(
            (item) => item.id === employeeId
        )

        if (!employee) {
            setActionError("Employee not found.")
            return
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/employees/${employeeId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: !employee.status,
                    }),
                }
            )

            if (!response.ok) {
                throw getApiError(
                    response,
                    "Failed to update employee status."
                )
            }

            await response.json()

            setRefreshKey(
                (previousKey) => previousKey + 1
            )
        } catch (caughtError) {
            setActionError(caughtError.message)
        }
    }

    async function deleteEmployee(employeeId) {
        setActionError("")

        const employee = employees.find(
            (item) => item.id === employeeId
        )

        if (!employee) {
            setActionError("Employee not found.")
            return
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/employees/${employeeId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw getApiError(
                    response,
                    "Failed to delete employee."
                )
            }

            setRefreshKey(
                (previousKey) => previousKey + 1
            )
        } catch (caughtError) {
            setActionError(caughtError.message)
        }
    }

    function clearFilters() {
        setSearch("")
        setDepartmentFilter("")
        setStatusFilter("")
    }

    return (
        <>
            <section id="center">
                <div className="page-heading">
                    <h2>Employee directory</h2>
                    <p>View and manage employee records.</p>
                </div>

                <EmployeeSummary
                    total={totalEmployees}
                    active={activeEmployees}
                    inactive={inactiveEmployees}
                    departments={departmentCount}
                />
            </section>

            <section
                id="employee-filters"
                aria-labelledby="filters-heading"
            >
                <h2 id="filters-heading">
                    Find employees
                </h2>

                <div className="filter-controls">
                    <div className="filter-group">
                        <label htmlFor="employee-search">
                            Search employees
                        </label>

                        <input
                            id="employee-search"
                            type="search"
                            placeholder="Search by name"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="department-filter">
                            Department
                        </label>

                        <select
                            id="department-filter"
                            value={departmentFilter}
                            onChange={(event) =>
                                setDepartmentFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                All departments
                            </option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">
                                Finance
                            </option>
                            <option value="Marketing">
                                Marketing
                            </option>
                            <option value="Operations">
                                Operations
                            </option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="status-filter">
                            Status
                        </label>

                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                All statuses
                            </option>
                            <option value="true">
                                Active
                            </option>
                            <option value="false">
                                Inactive
                            </option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>
            </section>

            {actionError && (
                <p role="alert">{actionError}</p>
            )}

            <section id="employee-list">
                {isLoading ? (
                    <p aria-live="polite">
                        Loading employees...
                    </p>
                ) : error ? (
                    <div role="alert">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setRefreshKey(
                                    (previousKey) =>
                                        previousKey + 1
                                )
                            }
                        >
                            Try again
                        </button>
                    </div>
                ) : employees.length === 0 ? (
                    <div>
                        <p>
                            {hasActiveFilters
                                ? "No employees match the current filters."
                                : "No employees found."}
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <EmployeeList
                        employees={employees}
                        onUpdateStatus={updateEmployeeStatus}
                        onDeleteEmployee={deleteEmployee}
                        onEditEmployee={(employeeId) =>
                            navigate(
                                `/employees/${employeeId}/edit`
                            )
                        }
                        isAdmin={isAdmin}
                    />
                )}
            </section>
        </>
    )
}

export default EmployeePage