import { useState } from "react";
import axios from "axios";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loginUser(allData) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      [
        "username",
        "password",
      ].forEach((key) => {
        formData.append(key, allData[key] || "");
      });

      const apiUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`;

      const res = await axios.post(
        apiUrl,
        {
          username: allData.username,
          password: allData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      
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

  return { loginUser, loading, error };
}
