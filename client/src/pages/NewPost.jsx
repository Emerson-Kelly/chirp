import TopNavigation from "../components/chirp/top-nav.jsx";
import CreatePost from "../components/chirp/create-post.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";

export default function NewPost() {
  return (
    <>
      <TopNavigation />

     <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 md:mb-0">
          {/* LEFT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <LeftSideNav variant="desktop" />
            </div>
          </div>

          {/* CREATE POST */}
          <div className="md:col-span-2">
            <CreatePost />
          </div>

          {/* RIGHT SIDEBAR (desktop only) */}
          <div className="hidden md:block md:col-span-1">
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <LeftSideNav variant="mobile" />
      </div>
    </>
  );
}
