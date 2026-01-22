import { useState, useRef } from "react";
import axios from "axios";

export default function useCreatePost({ token, onSuccess } = {}) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const MAX_CHARS = 280;

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageSelect(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const submitPost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();

      formData.append("caption", content);

      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContent("");
      removeImage();

      if (onSuccess) {
        setSuccess(true);
        onSuccess(res.data.post);
      }
    } catch (err) {
      console.error("Failed to create post", err);
      setError(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    // state
    content,
    imagePreview,
    isDragging,
    loading,
    error,
    success,
    MAX_CHARS,
    fileInputRef,

    // setters
    setContent,
    setIsDragging,

    // handlers
    handleImageSelect,
    handleDrop,
    removeImage,
    submitPost,
  };
}
