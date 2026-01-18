import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function useExplorePosts() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    async function fetchPosts() {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/posts/explore`;

        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched posts:", res.data);

        const postsArray = Array.isArray(res.data.posts) ? res.data.posts : [];
        setPosts(postsArray);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [user, token]);

  return { posts, loading, error };
}
