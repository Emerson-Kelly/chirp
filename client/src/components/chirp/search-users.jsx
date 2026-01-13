import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import useSearchUsers from "../../hooks/useSearchUsers";
import { Link } from "react-router-dom";

export default function SearchUsers() {
  const { token } = useAuth();

  const { query, setQuery, results, loading, error } = useSearchUsers({
    token,
  });
  console.log(results);

  return (
    <div className="max-w-xl mx-auto px-4 space-y-4">
      {/* SEARCH INPUT */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400 flex items-center mt-[-0.2rem]" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-10"
        />
      </div>

      {/* STATES */}
      {loading && <p className="text-sm text-muted-foreground">Searching…</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && query && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No users found</p>
      )}

      {/* RESULTS */}
      <div className="space-y-2">
        {results.map((user) => (
          <Link
            key={user.id}
            to={`/profile/${user.username}`}
            className="block"
          >
            <Card className="flex flex-row items-center gap-3 p-3 hover:bg-gray-50 transition">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={user.profileImageUrl || "/default-user-profile.jpg"}
                  className="object-cover"
                />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  @{user.username}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
