import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-7xl font-bold tracking-tight">404</h1>

        <p className="text-xl font-semibold">Page not found</p>

        <p className="text-muted-foreground">
          Sorry, the page you’re looking for doesn’t exist or may have been
          moved.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
