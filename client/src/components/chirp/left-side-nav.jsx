import {
  Home,
  Flame,
  Telescope,
  PlusCircle,
  Search,
  User,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LeftSideNav({ variant = "desktop" }) {
  const { user, token } = useAuth();

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Trending", icon: Flame, path: "/trending" },
    { name: "Explore", icon: Telescope, path: "/explore" },
    { name: "Create Post", icon: PlusCircle, path: "/new-post" },
    { name: "Search Users", icon: Search, path: "/search" },

    user && {
      name: "Profile",
      icon: User,
      path: `/users/${user.id}/profile`,
    },

    { name: "Settings", icon: Settings, path: "/settings" },
  ].filter(Boolean); // removes null if user not loaded

  if (variant === "mobile") {
    return (
      <nav
        className="
        fixed bottom-0 left-0 right-0 z-50
        flex justify-around items-center
        bg-white/90 backdrop-blur
        border-t border-gray-200
        py-2
        md:hidden
      "
      >
        {navItems.slice(0, -1).map((item) => (
          <NavLink key={item.name} to={item.path}>
            {({ isActive }) => (
              <div
                className={`p-2 rounded-xl ${
                  isActive ? "bg-gray-800 text-white" : "text-gray-600"
                }`}
              >
                <item.icon className="w-6 h-6" />
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    );
  }

  if (!token) return (null);

  return (
    <nav className="flex flex-col gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
      {navItems.map((item) => (
        <NavLink key={item.name} to={item.path}>
          {({ isActive }) => (
            <div
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "bg-gray-800 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <item.icon
                className={`
                  w-5 h-5 transition-colors
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                  }
                `}
              />

              <span className="text-sm font-medium">{item.name}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
