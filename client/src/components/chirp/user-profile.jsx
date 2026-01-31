import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { Button } from "../ui/button";
import useUserProfile from "../../hooks/useUserProfile.js";
import PostModal from "../../components/chirp/post-modal.jsx";
import FollowersModal from "../../components/chirp/followers-modal.jsx";

export default function UserProfile() {
  const { username } = useParams();
  const { token } = useAuth();
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalType, setModalType] = useState(null);

  const { profile, posts, isFollowing, toggleFollow, loading, error } =
    useUserProfile(username, token);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-24">
      {/* PROFILE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
        {/* Avatar */}
        <div className="flex justify-center sm:justify-start">
          <img
            src={profile.profileImageUrl || "/default-avatar.png"}
            alt={`${profile.username} avatar`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex sm:flex-row flex-col items-center flex-wrap justify-center sm:justify-start sm:gap-8 mt-0 text-lg">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {profile.username}
            </h2>

            <div className="sm:mt-0 mt-4">
              {/* Follow button */}
              {!profile.isOwner && (
                <Button
                  onClick={toggleFollow}
                  className={`px-6 py-2 text-sm rounded-full ${
                    isFollowing
                      ? "bg-secondary text-gray-900 hover:bg-gray-300"
                      : "bg-primary"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>
          {/* Follow stats */}
          <div className="flex sm:flex-nowrap flex-wrap items-center flex-wrap justify-center sm:justify-start gap-3 sm:gap-8 mt-3 text-lg">
            <button
              onClick={() => setModalType("followers")}
              className="hover:underline p-0!"
            >
              <strong>{profile._count?.followers}</strong> followers
            </button>
            <button
              onClick={() => setModalType("following")}
              className="hover:underline p-0!"
            >
              <strong>{profile._count?.following}</strong> following
            </button>
          </div>

          {/* User First and Last Name */}
          {profile.firstName && profile.lastName && (
            <h3 className="mt-2 font-bold text-gray-700 max-w-md mx-auto sm:mx-0">
              {profile.firstName} {profile.lastName}
            </h3>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-700 max-w-md mx-auto sm:mx-0">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* POSTS GRID */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-12">No posts yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="aspect-[4/5] overflow-hidden p-0!"
            >
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-full object-cover hover:brightness-75 transition"
              />
            </button>
          ))}
        </div>
      )}

      {/* MODALS */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}

      {modalType && (
        <FollowersModal
          username={username}
          type={modalType}
          token={token}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
