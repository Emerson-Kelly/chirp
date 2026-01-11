import { useState, useEffect } from "react";
import PostCard from "../../components/chirp/post-card.jsx";
import useHomePosts from "../../hooks/useHomeFeed.js";
import { useAuth } from "../../contexts/AuthContext";
import { Spinner } from "../../components/ui/spinner";
import axios from "axios";

export default function HomeFeed() {
  const { posts: initialPosts, loading, error } = useHomePosts();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (initialPosts) setPosts(initialPosts);
  }, [initialPosts]);

  // Handler for optimistic post removal
  const handleRemovePost = async (postId) => {
    // Optimistic UI: remove post immediately
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Failed to delete post", err);
      // Rollback if API fails
      setPosts((prev) => [...prev, posts.find((p) => p.id === postId)]);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center m-auto h-screen">
        <Spinner className={"size-20"} />
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center m-auto h-screen">
        <p className="text-center">Please log in to see posts</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center m-auto h-screen">
        <p className="text-center">Error loading posts</p>
      </div>
    );

  return (
    <main className="max-w-2xl mx-auto mt-16 px-4 py-6 space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleRemovePost} />
      ))}
    </main>
  );
}
