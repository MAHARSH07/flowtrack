import api from "./client";
import type { Task, TaskStatus } from "../types/task";


type TaskFilters = {
  status?: TaskStatus;
  assigned?: "me" | "unassigned";
  q?: string;
  page?: number;
  limit?: number;
};



export async function fetchTasks(filters?: TaskFilters): Promise<Task[]> {
  const res = await api.get("/tasks", {
    params: filters,
  });
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

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
) => {
  const res = await api.patch(`/tasks/${taskId}/status`, {
    status, 
  });
  return res.data;
};

export async function assignTask(
  taskId: string,
  assigneeId: string
) {
  const res = await api.patch(`/tasks/${taskId}/assign`, null, {
    params: { assignee_id: assigneeId },
  });
  return res.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
