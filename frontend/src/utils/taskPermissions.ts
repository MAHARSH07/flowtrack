import type { Task, TaskStatus } from "../types/task";
import type { User } from "../types/user";

export function getAllowedNextStatuses(
  task: Task,
  user: User
): TaskStatus[] {
  // Admin & Manager can do anything
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    return ["TODO", "IN_PROGRESS", "DONE"];
  }

  // Employee rules
  if (task.assigned_to_id !== user.id) {
    return [];
  }

  if (task.status === "TODO") return ["IN_PROGRESS"];
  if (task.status === "IN_PROGRESS") return ["DONE"];

  return [];
}