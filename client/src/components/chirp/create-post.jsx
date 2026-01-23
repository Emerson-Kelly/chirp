import { Image, X } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import useCreatePost from "../../hooks/useCreatePost";

export default function CreatePost() {
  const { token } = useAuth();

  const {
    content,
    imagePreview,
    isDragging,
    loading,
    MAX_CHARS,
    fileInputRef,
    error,
    success,
    setContent,
    setIsDragging,
    handleImageSelect,
    handleDrop,
    removeImage,
    submitPost,
  } = useCreatePost({
    token,
    onSuccess: () => {
      console.log("Post created!");
    },
  });

  if (!token)
    return (
      <div className="flex flex-col justify-center items-center m-auto h-screen">
        <p className="text-center">Please log in to see posts</p>
      </div>
    );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Create Post</h2>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitPost();
        }}
        className="px-4 py-4 space-y-4"
      >
        {/* IMAGE PREVIEW (4:5) */}
        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* DRAG & DROP */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
                ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:bg-gray-50"
                }
              `}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => handleImageSelect(e.target.files[0])}
          />

          <Image className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drag & drop an image, or{" "}
            <span className="font-medium text-gray-900">browse</span>
          </p>
        </div>

        {/* TEXT INPUT */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={MAX_CHARS}
          rows={4}
          className="w-full resize-none bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
        />

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span
            className={`text-sm ${
              content.length > MAX_CHARS * 0.9
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {MAX_CHARS - content.length}
          </span>
          <span className={"text-sm text-gray-400"}>
            *Image and caption are required
          </span>

          <Button
            type="submit"
            disabled={!content.trim() || loading || !imagePreview}
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 text-center">
            Posted successfully!
          </p>
        )}
      </form>
    </div>
  );
}
