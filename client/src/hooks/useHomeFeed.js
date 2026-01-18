import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function useHomePosts() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    async function fetchPosts() {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = import.meta.env.VITE_API_URL;

        // Fetch followers feed
        const followersRes = await axios.get(`${baseUrl}/api/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const followersPosts = Array.isArray(followersRes.data.posts)
          ? followersRes.data.posts
          : [];

        // If followers feed is empty → fetch explore feed
        if (followersPosts.length === 0) {
          const exploreRes = await axios.get(`${baseUrl}/api/posts/explore`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const explorePosts = Array.isArray(exploreRes.data.posts)
            ? exploreRes.data.posts
            : [];

          setPosts(explorePosts);
        } else {
          setPosts(followersPosts);
        }
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
