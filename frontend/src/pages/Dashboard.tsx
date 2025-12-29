import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";
import { useCurrentUser } from "../auth/useCurrentUser";
import CreateTask from "../components/CreateTask";
import Tasks from "./Tasks";

function Dashboard() {
  const navigate = useNavigate();

  // Logged-in user (RBAC)
  const { user, loading: userLoading } = useCurrentUser();

  const handleLogout = () => {
    logout(); // clear token
    navigate("/login", { replace: true }); // redirect immediately
  };

  // Wait until user info is loaded
  if (userLoading) {
    return <p>Loading...</p>;
  }

  // RBAC: who can create tasks
  const canCreateTask =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <h1>FlowTrack</h1>
        <button className="primary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Create Task (RBAC controlled) */}
      {canCreateTask && (
        <div className="section">
          <h2>Create Task</h2>
          <CreateTask />
        </div>
      )}

      {/* Tasks */}
      <div className="section">
        <h2>Tasks</h2>
        <Tasks />
      </div>
    </div>
  );
}

export default Dashboard;
