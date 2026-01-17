import TopNavigation from "../components/chirp/top-nav.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";
import HandleSettings from "../components/chirp/settings.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Settings() {
    const { logout } = useAuth();

  const navigate = useNavigate();
 
  function handleLogout() {
    logout();
    navigate("/login");
  }
  return (
    <>
      <TopNavigation />

      <div className="grid grid-cols-4 gap-4 max-w-7xl mx-auto px-4 mt-20">
        {/* LEFT SIDEBAR (25%) */}
        <div className="col-span-1">
          <div className="sticky top-20">
            <LeftSideNav />
          </div>
        </div>

        {/* MAIN FEED (50%) */}
        <div className="col-span-2">
          <HandleSettings />
        </div>

        {/* RIGHT COLUMN (25%) */}
        <div className="col-span-1">
          <Button type="button" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
