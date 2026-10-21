import { useState } from "react"

function createEmptyEmployee() {
  return {
    first_name: "",
    last_name: "",
    job_title: "",
    email: "",
    phone_number: "",
    employment_type: "",
    department: "",
    hire_date: "",
    status: true,
  }
}

function EmployeeForm({ onAddEmployee }) {
  const [newEmployee, setNewEmployee] = useState(createEmptyEmployee)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    const nextValue =
      name === "status"
        ? value === "true"
        : value

    setNewEmployee((previousEmployee) => ({
      ...previousEmployee,
      [name]: nextValue,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (
      newEmployee.first_name.trim() === "" ||
      newEmployee.last_name.trim() === ""
    ) {
      setError("Please enter both first and last names.")
      return
    }

    setIsSubmitting(true)

    try {

      const payload = {
        ...newEmployee,
        phone_number: newEmployee.phone_number.trim() || null,
      }

      await onAddEmployee(payload)
      setNewEmployee(createEmptyEmployee())
    } catch (caughtError) {
      setError(caughtError.message || "Unable to add employee.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="first-name">First name</label>
        <input
          id="first-name"
          name="first_name"
          type="text"
          value={newEmployee.first_name}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="last-name">Last name</label>
        <input
          id="last-name"
          name="last_name"
          type="text"
          value={newEmployee.last_name}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="employee-email">Email</label>
        <input
          id="employee-email"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={newEmployee.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="job-title">Job title</label>
        <input
          id="job-title"
          name="job_title"
          type="text"
          value={newEmployee.job_title}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="phone-number">Phone number</label>
        <input
          id="phone-number"
          name="phone_number"
          type="tel"
          value={newEmployee.phone_number}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="employment-type">Employment type</label>
        <select
          id="employment-type"
          name="employment_type"
          value={newEmployee.employment_type}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        >
          <option value="">Select employment type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="hire-date">Hire date</label>
        <input
          id="hire-date"
          name="hire_date"
          type="date"
          value={newEmployee.hire_date}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="department">Department</label>
        <select
          id="department"
          name="department"
          value={newEmployee.department}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        >
          <option value="">Select department</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="employee-status">Status</label>
        <select
          id="employee-status"
          name="status"
          value={String(newEmployee.status)}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding employee..." : "Add employee"}
      </button>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default EmployeeForm