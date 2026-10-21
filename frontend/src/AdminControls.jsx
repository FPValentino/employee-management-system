function AdminControls(props) {
    return (
       props.isAdmin && <button>Edit Employee</button>
    )
}

export default AdminControls