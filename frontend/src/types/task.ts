export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  created_by_id: string;
  assigned_to_id?: string;
  created_at: string;
  updated_at: string;
}
