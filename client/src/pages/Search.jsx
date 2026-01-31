import TopNavigation from "../components/chirp/top-nav.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";
import SearchUsers from "../components/chirp/search-users.jsx";

export default function Search() {
  return (
    <>
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 pt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-5rem)]">
          {/* LEFT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <LeftSideNav variant="desktop" />
            </div>
          </div>

          {/* SEARCH USERS */}
          <div className="md:col-span-2 pb-16">
            <SearchUsers />
          </div>

          <div className="hidden md:block md:col-span-1"></div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <LeftSideNav variant="mobile" />
      </div>
    </>
  );
}
