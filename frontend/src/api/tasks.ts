import api from "./client";
import type { Task, TaskStatus } from "../types/task";


export async function fetchTasks(): Promise<Task[]> {
  const res = await api.get("/tasks");
  return res.data;
}

export async function createTask(data: {
  title: string;
  description?: string;
  assigned_to_id?: string;
}): Promise<Task> {
  const res = await api.post("/tasks", data);
  return res.data;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task> {
  const res = await api.patch(`/tasks/${taskId}/status`, null, {
    params: { status },
  });
  return res.data;
}
