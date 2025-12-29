export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  is_active: boolean;
  created_at: string;
}
