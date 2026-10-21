function EmployeeStatusToggle({ id, status, onUpdateStatus }) {
  function handleClick() {
    onUpdateStatus(id)
  }

  return (
    <button type="button" onClick={handleClick}>
      {status ? "Deactivate Employee" : "Activate Employee"}
    </button>
  )
}

export default EmployeeStatusToggle