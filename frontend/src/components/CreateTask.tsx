import { useEffect, useState } from "react";
import { createTask } from "../api/tasks";
import { fetchEmployees, type UserOption } from "../api/users";

type Props = {
  onCreated?: () => void;
};

function CreateTask({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState<UserOption[]>([]);
  const [assignedTo, setAssignedTo] = useState<string | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await createTask({
      title,
      description,
      assigned_to_id: assignedTo || undefined,
    });

    setTitle("");
    setDescription("");
    setAssignedTo("");
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

          {employees.length > 0 && (
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Assign to employee (optional)</option>
              {employees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          )}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
;
}

export default CreateTask;
