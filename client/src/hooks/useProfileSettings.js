import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function useProfileSettings(userId, token) {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load profile
  useEffect(() => {
    if (!token) return;

    async function loadProfile() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = {
          username: res.data.username || "",
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          bio: res.data.bio || "",
          profileImageUrl: res.data.profileImageUrl || null,
        };

        setForm({
          username: profileData.username,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
        });
        setProfileImageUrl(profileData.profileImageUrl);

        // Initialize AuthContext
        updateUser(profileData);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfileImageUrl(previewUrl);

    // Optimistic navbar image update
    updateUser({ profileImageUrl: previewUrl });
  }

  async function saveProfile() {
    if (!userId || !token) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const previousUser = { ...user };
    const previousImage = profileImageUrl;

    try {
      // Optimistic navbar username update
      updateUser({ username: form.username });

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profileImageFile) {
        formData.append("profile-images", profileImageFile);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.profile) {
        const updatedUser = {
          username: res.data.profile.username,
          firstName: res.data.profile.firstName,
          lastName: res.data.profile.lastName,
          bio: res.data.profile.bio,
          profileImageUrl: res.data.profile.profileImageUrl || profileImageUrl,
        };

        // Update form fields only
        setForm({
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          bio: updatedUser.bio,
        });

        setProfileImageUrl(updatedUser.profileImageUrl);
        updateUser(updatedUser);

        setProfileImageFile(null);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);

      // Rollback optimistic changes
      updateUser(previousUser);
      setProfileImageUrl(previousImage);

      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    profileImageUrl,
    loading,
    saving,
    error,
    success,
    handleChange,
    handleImageChange,
    saveProfile,
  };
}
