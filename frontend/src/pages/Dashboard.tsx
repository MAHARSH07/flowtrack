import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";
import CreateTask from "../components/CreateTask";
import Tasks from "./Tasks";
import { fetchTasks } from "../api/tasks";
import type { Task } from "../types/task";

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    logout();               // clear token
    navigate("/login", { replace: true }); // redirect immediately
  };

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

      {/* Create Task Section */}
      <div className="section">
        <h2>Create Task</h2>
        <CreateTask onCreated={loadTasks} />
      </div>

      {/* Tasks Section */}
      <div className="section">
        <h2>Tasks</h2>
        {loading ? <p>Loading...</p> : <Tasks />}
      </div>
    </div>
  );
}

export default Dashboard;
