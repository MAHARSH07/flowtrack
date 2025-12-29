import { useState } from "react";
import { createTask } from "../api/tasks";

type Props = {
  onCreated?: () => void;
};

function CreateTask({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await createTask({ title, description });

    setTitle("");
    setDescription("");
    setLoading(false);

    onCreated?.();
  };

  return (
    <div className="section">
      <form onSubmit={submit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
