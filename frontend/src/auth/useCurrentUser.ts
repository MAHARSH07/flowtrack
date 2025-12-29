import { useEffect, useState } from "react";
import api from "../api/client";
import type { User } from "../types/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me")
      .then(res => setUser(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
