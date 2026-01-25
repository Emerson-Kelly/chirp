import { useEffect, useState } from "react";
import axios from "axios";

export default function useUserProfile(username, token) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  
    if (!username || !token) return;

    async function fetchProfile() {
      try {
        setLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(res.data.profile);
        setPosts(res.data.posts ?? []);
        setIsFollowing(res.data.isFollowing ?? false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username, token]);

  const toggleFollow = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${username}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // backend should return updated state
      const { isFollowing: newIsFollowing, followersCount } = res.data;

      setIsFollowing(newIsFollowing);

      // update follower count safely
      setProfile((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: followersCount,
        },
      }));
    } catch (err) {
      console.error("Follow toggle failed", err);
    }
  };

  return {
    profile,
    posts,
    isFollowing,
    toggleFollow,
    loading,
    error,
  };
}
