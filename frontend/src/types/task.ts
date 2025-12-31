export type UserSummary = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;

  created_by_id: string;
  assigned_to_id?: string | null;

  assigned_to?: UserSummary | null; 

  created_at: string;
  updated_at: string;
};
