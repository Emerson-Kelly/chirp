import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Home,
  Flame,
  Telescope,
  PlusCircle,
  Search,
  User,
  Settings,
  LogOut,
} from "lucide-react";
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

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Trending", icon: Flame, path: "/trending" },
    { name: "Explore", icon: Telescope, path: "/explore" },
    { name: "Create Post", icon: PlusCircle, path: "/new-post" },
    { name: "Search Users", icon: Search, path: "/search" },

    user && {
      name: "Profile",
      icon: User,
      path: `/users/${user.username}`,
    },

    { name: "Settings", icon: Settings, path: "/settings" },
  ].filter(Boolean);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) return null;

  return (
    <header className="bg-background border-b px-4 md:px-6 flex items-center justify-between h-14 shadow fixed top-0 right-0 left-0 z-12">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-semibold text-lg">chirp</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">{user.username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="p-0">
              <Button variant="ghost" size="icon">
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {navItems.map((item) => (
                <DropdownMenuItem
                  className={"cursor-pointer"}
                  key={item.name}
                  asChild
                >
                  <NavLink to={item.path}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={"cursor-pointer"}
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
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
