import { useEffect, useState } from "react";
import axios from "axios";

export default function useFollowers(userId, type, token) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${userId}/${type}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(
          type === "followers"
            ? res.data.map((f) => f.follower)
            : res.data.map((f) => f.following)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, token]);

  return { users, loading };
}
