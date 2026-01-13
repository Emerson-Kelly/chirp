import { useState, useEffect } from "react";
import axios from "axios";

export default function useSearchUsers({ token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/search`,
          {
            params: { q: query },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResults(res.data.users);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to search users");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, token]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
}
