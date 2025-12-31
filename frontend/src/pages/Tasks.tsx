import { useState } from "react";
import { updateTaskStatus } from "../api/tasks";
import { useCurrentUser } from "../auth/useCurrentUser";
import type { Task, TaskStatus } from "../types/task";

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

  if (userLoading) return <p>Loading tasks...</p>;
  if (tasks.length === 0) return <p>No tasks found</p>;

  return (
    <div className="task-grid">
      {tasks.map((task) => {
        const allowed = getAllowedStatuses(task);
        const isUnassigned = !task.assigned_to_id;

        return (
          <div key={task.id} className="task-card">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}

            {/* Status */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className={`status-pill status-${task.status}`}>
                {task.status}
              </span>

              {isUnassigned && (
                <span className="status-pill status-unassigned">
                  Unassigned
                </span>
              )}
            </div>

            {/* Actions */}
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
