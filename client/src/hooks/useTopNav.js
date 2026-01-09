/*
import { useState } from "react";
import axios from "axios";

export default function useTopNav() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function registerUser(allData) {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/users/:id/profile`;

      const res = await axios.get(apiUrl, {
        headers: { Accept: "application/json" },
      });

      console.log(res.data);

      return res.data;
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const messages = err.response.data.errors.map((e) => e.msg).join(", ");
        setError(messages);
      } else {
        setError(err.response?.data?.error || "Network error");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { registerUser, loading, error };
}
*/