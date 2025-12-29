import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";
import { useCurrentUser } from "../auth/useCurrentUser";
import CreateTask from "../components/CreateTask";
import Tasks from "./Tasks";
import { fetchTasks } from "../api/tasks";
import type { Task } from "../types/task";

function Dashboard() {
  const navigate = useNavigate();

  // Logged-in user (RBAC)
  const { user, loading: userLoading } = useCurrentUser();

  // 🔑 Dashboard owns task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    const data = await fetchTasks();
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (userLoading) {
    return <p>Loading...</p>;
  }

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

      {/* Create Task */}
      {canCreateTask && (
        <div className="section">
          <h2>Create Task</h2>
          <CreateTask onCreated={loadTasks} />
        </div>
      )}

      {/* Tasks */}
      <div className="section">
        <h2>Tasks</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <Tasks tasks={tasks} onRefresh={loadTasks} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
