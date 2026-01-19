import { useDisplayRecentUsers, useMostFollowedUsers } from "../../hooks/useRightSideNav";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { Separator } from "../../components/ui/separator";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";

export default function RightSideNav(userId) {
    const { user, token } = useAuth();
  const { recentUsers, loading } = useDisplayRecentUsers(userId, token);
  const { mostFollowedUsers } = useMostFollowedUsers(userId, token);

  return (
    <div className="flex flex-col gap-6">
    <nav className="flex flex-col gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
         <div className="flex flex-col gap-3 mb-3">
         <h3 className="text-md font-medium">Latest users</h3>
         <Separator />
         </div>
      {loading ? (
        <p className="text-center text-sm">Loading...</p>
      ) : (
        <NavLink key={user.name} to={user.path}>
          <div className="space-y-6">
            {recentUsers.map((user) => (
              <Link
                key={user.id}
                to={`/users/${user.id}/profile`}
                className="flex items-center gap-3"
              >
                <Avatar className="w-8 h-8 border cursor-pointer">
                  <AvatarImage
                    src={user.profileImageUrl || "/default-user-profile.jpg"}
                    alt={`Profile of ${user.username}`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">@{user.username}</span>
              </Link>
            ))}
          </div>
        </NavLink>
      )}
    </nav>  
    <nav className="flex flex-col gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
         <div className="flex flex-col gap-3 mb-3">
         <h3 className="text-md font-medium">Most followed</h3>
         <Separator />
         </div>
       
      {loading ? (
        <p className="text-center text-sm">Loading...</p>
      ) : (
        <NavLink key={user.name} to={user.path}>
          <div className="space-y-6">
            {mostFollowedUsers.map((user) => (
              <Link
                key={user.id}
                to={`/users/${user.id}/profile`}
                className="flex items-center gap-3"
              >
                <Avatar className="w-8 h-8 border cursor-pointer">
                  <AvatarImage
                    src={user.profileImageUrl || "/default-user-profile.jpg"}
                    alt={`Profile of ${user.username}`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">@{user.username}</span>
              </Link>
            ))}
          </div>
        </NavLink>
      )}
    </nav>

    </div>
  );
}
