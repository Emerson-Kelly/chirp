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

      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* LEFT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <LeftSideNav variant="desktop" />
            </div>
          </div>

          {/* Settings */}
          <div className="md:col-span-2">
            <HandleSettings />
          </div>

          {/* LOGOUT CTA */}
          <div className="md:block md:col-span-1 mb-24 md:mb-0 px-4 flex justify-end">
            <div className="sticky top-20">
              <Button type="button" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <LeftSideNav variant="mobile" />
      </div>
    </>
  );
}
