import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { Button } from "../ui/button";
import useUserProfile from "../../hooks/useUserProfile.js";
import PostModal from "../../components/chirp/post-modal.jsx";
import FollowersModal from "../../components/chirp/followers-modal.jsx";

export default function UserProfile() {
  const { id } = useParams();
  const { token } = useAuth();
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalType, setModalType] = useState(null);

  const { profile, posts, isFollowing, toggleFollow, loading, error } =
    useUserProfile(id, token);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (!profile) return null;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-6">
        <img
          src={profile.profileImageUrl || "/default-avatar.png"}
          className="w-28 h-28 rounded-full object-cover"
        />

        <div>
          <h2 className="text-2xl font-semibold">{profile.username}</h2>

          <div className="flex gap-4 mt-2 text-sm">
            <button onClick={() => setModalType("followers")}>
              <strong>{profile._count?.followers}</strong> followers
            </button>
            <button onClick={() => setModalType("following")}>
              <strong>{profile._count?.following}</strong> following
            </button>
          </div>

          {!profile.isOwner && (
            <Button
              onClick={toggleFollow}
              className={`mt-3 px-4 py-1.5 rounded text-sm ${
                isFollowing ? "bg-gray-200" : "bg-blue-500 text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      {/* POSTS GRID */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {" "}
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="aspect-square bg-gray-100 overflow-hidden"
            >
              {" "}
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-full object-cover hover:brightness-50"
              />{" "}
            </button>
          ))}{" "}
        </div>
      )}

      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}

      {modalType && (
        <FollowersModal
          userId={id}
          type={modalType}
          token={token}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
