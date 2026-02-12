import useFollowers from "../../hooks/useFollowers";
import { Link } from "react-router-dom";

export default function FollowersModal({ username, type, token, onClose }) {
  const { users, loading } = useFollowers(username, type, token);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm p-4 h-full max-h-[70vh] overflow-y-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-center mb-4 capitalize">{type}</h3>

        {loading ? (
          <p className="text-center text-sm">Loading...</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Link
                key={user.username}
                to={`/users/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-3"
              >
                <img
                  src={user.profileImageUrl || "/default-user-profile.jpg"}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="text-sm font-medium">@{user.username}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
