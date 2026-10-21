import EmployeeCard from './EmployeeCard'

function EmployeeList({employees, onUpdateStatus, onDeleteEmployee, onEditEmployee,isAdmin}) {
    return (
        <ul>
            {employees.map((employee) => 
                <li key={employee.id}>
                    <EmployeeCard 
                        id={employee.id}
                        name={`${employee.first_name} ${employee.last_name}`}
                        email={employee.email}
                        department={employee.department}
                        hireDate={employee.hire_date}
                        status={employee.status}
                        jobTitle={employee.job_title}
                        phoneNumber={employee.phone_number}
                        employmentType={employee.employment_type}
                        isAdmin={isAdmin}
                        onUpdateStatus={onUpdateStatus}
                        onDeleteEmployee={onDeleteEmployee}
                        onEditEmployee={onEditEmployee}
                    />
                </li>
            )}
        </ul>
    )
}

export default EmployeeList
