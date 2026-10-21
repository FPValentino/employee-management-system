import EmployeeStatusToggle from "./EmployeeStatusToggle.jsx"

function EmployeeCard({
  id,
  name,
  email,
  department,
  hireDate,
  status,
  isAdmin,
  onUpdateStatus,
  onDeleteEmployee,
  jobTitle,
  phoneNumber,
  employmentType,
  onEditEmployee,
}) {
  const formattedHireDate = new Date(
    `${hireDate}T00:00:00`
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const readableEmploymentType = employmentType
    ? employmentType
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ")
    : "Not specified"

  return (
    <article className="employee-card">
      <h3>{name}</h3>

      <p><strong>Job title:</strong> {jobTitle}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Phone:</strong> {phoneNumber || "Not provided"}</p>
      <p><strong>Employment type:</strong> {readableEmploymentType}</p>
      <p><strong>Department:</strong> {department}</p>
      <p>
        <strong>Hire date:</strong>{" "}
        <time dateTime={hireDate}>{formattedHireDate}</time>
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`status-badge ${
            status ? "status-active" : "status-inactive"
          }`}
        >
          {status ? "Active" : "Inactive"}
        </span>
      </p>

      {isAdmin && (
        <div className="employee-actions">
          <EmployeeStatusToggle
            id={id}
            status={status}
            onUpdateStatus={onUpdateStatus}
          />

          <button
            type="button"
            onClick={() => onEditEmployee(id)}
          >
            Edit employee
          </button>

          <button
            type="button"
            onClick={() => onDeleteEmployee(id)}
          >
            Delete Employee
          </button>
        </div>
      )}
    </article>
  )
}

export default EmployeeCard