import { useAuth } from "../../contexts/AuthContext";
import usePostById from "../../hooks/usePostById";
import PostCard from "../chirp/post-card";

export default function PostModal({ postId, onClose }) {
  const { token } = useAuth();
  const { post, loading, error } = usePostById(postId, token);

  if (!postId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <p className="text-white text-center">Loading post...</p>
        )}

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {post && <PostCard post={post} />}
      </div>
    </div>
  );
}
