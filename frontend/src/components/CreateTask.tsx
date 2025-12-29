import { useState } from "react";
import { createTask } from "../api/tasks";

function CreateTask({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTask({ title, description });
      setTitle("");
      setDescription("");
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">

      <div className="create-task-card">
        <form onSubmit={submit} className="create-task-card">
            <input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <textarea
                placeholder="Task description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit" className="primary">
                Create Task
            </button>
        </form>

      </div>
    </div>
  );
}

export default CreateTask;
