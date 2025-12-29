import { useEffect, useState } from "react";
import { fetchTasks, updateTaskStatus } from "../api/tasks";
import type { Task, TaskStatus } from "../types/task";

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (taskId: string, status: TaskStatus) => {
    try {
      setUpdatingId(taskId);
      const updated = await updateTaskStatus(taskId, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="section">

    {tasks.length === 0 && <p>No tasks found</p>}

    <div className="task-grid">
        {tasks.map((task) => (
        <div key={task.id} className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            <span className={`status-pill status-${task.status}`}>
            {task.status}
            </span>

            <div style={{ marginTop: "12px" }}>
            <button
                className="secondary"
                onClick={() => changeStatus(task.id, "TODO")}
            >
                Move to TODO
            </button>

            <button
                className="secondary"
                onClick={() => changeStatus(task.id, "IN_PROGRESS")}
            >
                Start
            </button>

            <button
                className="primary"
                onClick={() => changeStatus(task.id, "DONE")}
            >
                Complete
            </button>
            </div>
        </div>
        ))}

    </div>
    </div>

  );
}

export default Tasks;
