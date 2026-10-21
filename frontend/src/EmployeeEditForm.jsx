import { useEffect, useState } from "react"

function getFormData(employee) {
  return {
    first_name: employee.first_name,
    last_name: employee.last_name,
    job_title: employee.job_title,
    email: employee.email,
    phone_number: employee.phone_number ?? "",
    employment_type: employee.employment_type,
    department: employee.department,
    hire_date: employee.hire_date,
  }
}

function EmployeeEditForm({
  employee,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState(
    () => getFormData(employee)
  )

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData(getFormData(employee))
  }, [employee])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await onSave({
        ...formData,
        phone_number: formData.phone_number.trim() || null,
      })
    } catch (caughtError) {
      setError(
        caughtError.message || "Unable to update employee."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="employee-edit-form"
      onSubmit={handleSubmit}
    >
      <h2>
        Edit {employee.first_name} {employee.last_name}
      </h2>

      <p className="edit-form-description">
        Update the employee's information below.
      </p>

      <div className="form-field">
        <label htmlFor="edit-first-name">First name</label>
        <input
          id="edit-first-name"
          name="first_name"
          type="text"
          value={formData.first_name}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-last-name">Last name</label>
        <input
          id="edit-last-name"
          name="last_name"
          type="text"
          value={formData.last_name}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-email">Email</label>
        <input
          id="edit-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-job-title">Job title</label>
        <input
          id="edit-job-title"
          name="job_title"
          type="text"
          value={formData.job_title}
          onChange={handleChange}
          minLength={2}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-phone">Phone number</label>
        <input
          id="edit-phone"
          name="phone_number"
          type="tel"
          value={formData.phone_number}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-employment-type">
          Employment type
        </label>

        <select
          id="edit-employment-type"
          name="employment_type"
          value={formData.employment_type}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="edit-hire-date">Hire date</label>
        <input
          id="edit-hire-date"
          name="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="edit-department">Department</label>

        <select
          id="edit-department"
          name="department"
          value={formData.department}
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

      <div className="edit-form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving changes..."
            : "Save changes"}
        </button>

        <button
            className="secondary-button"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
        >
            Cancel
        </button>
      </div>

      {error && <p role="alert">{error}</p>}
    </form>
  )
}

export default EmployeeEditForm