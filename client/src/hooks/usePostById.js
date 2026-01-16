import { useEffect, useState } from "react";
import axios from "axios";

export default function usePostById(postId, token) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId || !token) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/posts/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPost(res.data.post);
      } catch (err) {
        console.error("Failed to fetch post", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, token]);

  return { post, loading, error };
}
