import TopNavigation from "../components/chirp/top-nav.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";
import UserProfile from "../components/chirp/user-profile.jsx"

export default function Profile() {
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

        {/* USER PROFILE (75%) */}
        <div className="col-span-3">
          <UserProfile />
        </div>
      </div>
    </>
  );
}
