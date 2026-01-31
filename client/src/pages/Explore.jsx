import TopNavigation from "../components/chirp/top-nav.jsx";
import ExploreFeed from "../components/chirp/explore-feed.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";
import RightSideNav from "../components/chirp/right-side-nav.jsx";

export default function ExplorePosts() {
  return (
    <>
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-0 sm:px-4 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 md:mb-0">
          {/* LEFT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <LeftSideNav variant="desktop" />
            </div>
          </div>

          {/* EXPLORE FEED */}
          <div className="md:col-span-2">
            <ExploreFeed />
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
