import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export default function TopNavigation() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) return null;

  return (
    <header className="bg-background border-b px-4 md:px-6 flex items-center justify-between h-14 shadow">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-semibold text-lg">chirp</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">
            {user.username}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8 border cursor-pointer">
                  <AvatarImage
                    src={user.profileImageUrl || "/default-user-profile.jpg"}
                    alt={`Profile of ${user.username}`}
                  />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className={"cursor-pointer"}>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
