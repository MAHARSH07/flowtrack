import api from "./client";

export type UserOption = {
  id: string;
  email: string;
  role: string;
};

export const fetchEmployees = async (): Promise<UserOption[]> => {
  const res = await api.get("/users");
  return res.data;
};
