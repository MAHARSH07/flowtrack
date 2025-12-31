import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";
import { useCurrentUser } from "../auth/useCurrentUser";
import CreateTask from "../components/CreateTask";
import Tasks from "./Tasks";
import { fetchTasks } from "../api/tasks";
import type { Task, TaskStatus } from "../types/task";

type StatusFilter = "ALL" | TaskStatus;
type AssignmentFilter = "ALL" | "ME" | "UNASSIGNED";

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useCurrentUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilter>("ALL");

  const loadTasks = async (
    filters?: { status?: TaskStatus; assigned?: "me" | "unassigned" }
  ) => {
    setLoading(true);
    const data = await fetchTasks(filters);
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    const filters: any = {};

    if (statusFilter !== "ALL") {
      filters.status = statusFilter;
    }

    if (assignmentFilter === "ME") {
      filters.assigned = "me";
    }

    if (assignmentFilter === "UNASSIGNED") {
      filters.assigned = "unassigned";
    }

    loadTasks(filters);
  }, [statusFilter, assignmentFilter]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (userLoading) return <p>Loading...</p>;

  const canCreateTask =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const canSeeUnassigned =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
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

      {/* Filters */}
      <div className="section">
        <h2>Filters</h2>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
          >
            <option value="ALL">All statuses</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <select
            value={assignmentFilter}
            onChange={(e) =>
              setAssignmentFilter(e.target.value as AssignmentFilter)
            }
          >
            <option value="ALL">All tasks</option>
            <option value="ME">Assigned to me</option>
            {canSeeUnassigned && (
              <option value="UNASSIGNED">Unassigned</option>
            )}
          </select>
        </div>
      </div>

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
