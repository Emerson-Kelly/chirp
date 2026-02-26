import TopNavigation from "../components/chirp/top-nav.jsx";
import HomeFeed from "../components/chirp/home-feed.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";
import RightSideNav from "../components/chirp/right-side-nav.jsx";

export default function HomePosts() {
  return (
    <>
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-0 sm:px-4 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 md:mb-0">
          {/* LEFT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <LeftSideNav variant="desktop" />
            </div>
          </div>

          {/* HOME FEED */}
          <div className="md:col-span-2">
            <HomeFeed />
          </div>

          {/* RIGHT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <RightSideNav />
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <LeftSideNav variant="mobile" />
      </div>
    </>
  );
}
