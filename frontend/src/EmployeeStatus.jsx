function EmployeeStatus(props) {
    return (
        <p>{props.active ? "Employee is Active" : "Employee is Inactive"}</p>
    )
}

export default EmployeeStatus