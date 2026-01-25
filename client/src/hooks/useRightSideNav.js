import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export function useDisplayRecentUsers() {
  const { user, token } = useAuth();
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    async function fetchRecentUsers() {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/users/recent`;

        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched recent users:", res.data);

        const postsArray = Array.isArray(res.data.users) ? res.data.users : [];
        setRecentUsers(postsArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentUsers();
  }, [user, token]);

  return { recentUsers, loading, error };
}

export function useMostFollowedUsers() {
  const { user, token } = useAuth();
  const [mostFollowedUsers, setMostFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    async function fetchMostFollowedUsers() {
      try {
        const apiUrl = `${
          import.meta.env.VITE_API_URL
        }/api/users/most-followed`;

        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched most followed users:", res.data);

        const postsArray = Array.isArray(res.data.users) ? res.data.users : [];
        setMostFollowedUsers(postsArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMostFollowedUsers();
  }, [user, token]);

  return { mostFollowedUsers, loading, error };
}
