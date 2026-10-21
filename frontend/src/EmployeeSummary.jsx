function EmployeeSummary(props) {
    return (
        <section id="employee-summary">
        <article>
            <h3>Total employees</h3>
            <p>{props.total}</p>
        </article>

        <article>
            <h3>Active employees</h3>
            <p>{props.active}</p>
        </article>

        <article>
            <h3>Inactive employees</h3>
            <p>{props.inactive}</p>
        </article>

        <article>
            <h3>Departments</h3>
            <p>{props.departments}</p>
        </article>
        </section>
    )
}

export default EmployeeSummary