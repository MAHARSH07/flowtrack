import { useEffect, useState } from "react";
import { updateTaskStatus, assignTask } from "../api/tasks";
import { useCurrentUser } from "../auth/useCurrentUser";
import type { Task, TaskStatus } from "../types/task";
import { fetchEmployees } from "../api/users";
import type { UserOption } from "../api/users";

type Props = {
  tasks: Task[];
  onRefresh: () => Promise<void>;
};

function Tasks({ tasks, onRefresh }: Props) {
  const { user, loading: userLoading } = useCurrentUser();

  const [updating, setUpdating] = useState<{
    taskId: string;
    status: TaskStatus;
  } | null>(null);

  const [employees, setEmployees] = useState<UserOption[]>([]);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);

  // Fetch employees only for ADMIN / MANAGER
  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      fetchEmployees().then(setEmployees);
    }
  }, [user]);

  const getAllowedStatuses = (task: Task): TaskStatus[] => {
    if (!user) return [];

    if (user.role === "ADMIN" || user.role === "MANAGER") {
      return ["TODO", "IN_PROGRESS", "DONE"];
    }

    if (task.assigned_to_id !== user.id) return [];

    if (task.status === "TODO") return ["IN_PROGRESS"];
    if (task.status === "IN_PROGRESS") return ["DONE"];

    return [];
  };

  const changeStatus = async (taskId: string, status: TaskStatus) => {
    try {
      setUpdating({ taskId, status });
      await updateTaskStatus(taskId, status);
      await onRefresh();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Action not allowed";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setUpdating(null);
    }
  };

  const handleAssign = async (taskId: string, assigneeId: string) => {
    try {
      setAssigningTaskId(taskId);
      await assignTask(taskId, assigneeId);
      await onRefresh();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Assignment not allowed";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setAssigningTaskId(null);
    }
  };

  if (userLoading) return <p>Loading tasks...</p>;
  if (tasks.length === 0) return <p>No tasks found</p>;

  const canAssign = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="task-grid">
      {tasks.map((task) => {
        const allowed = getAllowedStatuses(task);
        const isAssignedToMe = user?.id === task.assigned_to_id;

        const isUnassigned = !task.assigned_to;

        return (
          <div
            key={task.id}
            className={`task-card ${isAssignedToMe ? "task-card-mine" : ""}`}
          >

            {/* Header */}
            <div className="task-header">
              <h3>{task.title}</h3>

              <div className="task-meta">
                <span className={`status-pill status-${task.status}`}>
                  {task.status}
                </span>

                {isUnassigned && (
                  <span className="status-pill status-unassigned">
                    Unassigned
                  </span>
                )}

                {isAssignedToMe && (
                  <span className="status-pill status-mine">
                    Assigned to you
                  </span>
                )}

              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="task-desc">{task.description}</p>
            )}

            {/* Assigned To */}
            <div className="task-owner">
              {task.assigned_to ? (
                <span>
                  Assigned to{" "}
                  <strong>{task.assigned_to.full_name}</strong>{" "}
                  <span className="muted">
                    ({task.assigned_to.email})
                  </span>
                </span>
              ) : (
                <span className="muted">No owner</span>
              )}
            </div>

            {/* Assignment dropdown (ADMIN / MANAGER only) */}
            {canAssign && employees.length > 0 && (
              <div className="task-assign">
                <label>Reassign</label>

                <select
                  value={task.assigned_to_id || ""}
                  disabled={assigningTaskId === task.id}
                  onChange={(e) => {
                    const assigneeId = e.target.value;
                    if (!assigneeId) return;
                    handleAssign(task.id, assigneeId);
                  }}
                >
                  <option value="">Unassigned</option>

                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status actions */}
            {allowed.length > 0 && (
              <div className="task-actions">
                {allowed.map((status) => {
                  const isUpdating =
                    updating?.taskId === task.id &&
                    updating.status === status;

                  return (
                    <button
                      key={status}
                      className="secondary"
                      disabled={isUpdating}
                      onClick={() => changeStatus(task.id, status)}
                    >
                      {isUpdating ? "Updating..." : `Move to ${status}`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Tasks;
