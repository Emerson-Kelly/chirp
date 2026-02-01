import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Field, FieldLabel, FieldGroup } from "../ui/field";
import { useAuth } from "../../contexts/AuthContext";
import useProfileSettings from "../../hooks/useProfileSettings";

export default function Settings() {
  const { token, user, } = useAuth();

  const {
    form,
    profileImageUrl,
    loading,
    saving,
    error,
    success,
    handleChange,
    handleImageChange,
    saveProfile,
  } = useProfileSettings(user, token);

  function handleSubmit(e) {
    e.preventDefault();
    saveProfile();
  }

  if (loading && user) return <p className="text-center mt-8">Loading...</p>;

  if (!token)
    return (
      <div className="flex flex-col justify-center items-center m-auto h-screen">
        <p className="text-center">Please log in to see posts</p>
      </div>
    );

  return (
    <div className="flex px-4 justify-center">
      <Card className="w-full max-w-xl rounded-2xl shadow-lg border-none">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Account settings</CardTitle>
          <CardDescription>Manage your profile information</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {profileImageUrl && (
              <div className="flex justify-center">
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border"
                />
              </div>
            )}

            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>First name</FieldLabel>
                <Input name="firstName" value={form.firstName} onChange={handleChange} />
              </Field>

              <Field>
                <FieldLabel>Last name</FieldLabel>
                <Input name="lastName" value={form.lastName} onChange={handleChange} />
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input name="username" value={form.username} onChange={handleChange} />
            </Field>

            <Field>
              <FieldLabel>Bio</FieldLabel>
              <Textarea
                name="bio"
                maxLength={150}
                rows={4}
                value={form.bio}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel>Profile image</FieldLabel>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </Field>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {success && <p className="text-sm text-green-600 text-center">Profile updated successfully</p>}

            <div className="flex justify-right pt-4">
              <Button disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
