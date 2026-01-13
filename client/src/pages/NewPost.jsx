import TopNavigation from "../components/chirp/top-nav.jsx";
import CreatePost from "../components/chirp/create-post.jsx";
import LeftSideNav from "../components/chirp/left-side-nav.jsx";

export default function NewPost() {
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
          <CreatePost/>
        </div>

        {/* RIGHT COLUMN (25%) */}
        <div className="col-span-1">
    
        </div>
      </div>
    </>
  );
}
