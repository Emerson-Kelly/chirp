import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "/src/components/ui/card";
import { Button } from "/src/components/ui/button";
import { Input } from "/src/components/ui/input";
import { Textarea } from "/src/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "/src/components/ui/field";
import { Progress } from "/src/components/ui/progress";
import useRegister from "../../hooks/useRegister.js";
import { useNavigate } from "react-router-dom";

export default function MultiStepSignupForm() {
  const navigate = useNavigate();
  const { registerUser, loading, error } = useRegister();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    bio: "",
    image: null,
  });

  function updateField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function nextStep() {
    if (step < 3) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const result = await registerUser(formData);

    if (result) {
      navigate('/login')
    }
  }

  return (
    <Card className="w-full max-w-xl m-auto p-6 rounded-2xl shadow-md">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>

        <Progress value={(step / 3) * 100} className="my-4" />

        <CardContent>
          {step === 1 && (
            <>
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>

              <FieldGroup className="pt-6">
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                  />
                  <FieldDescription>
                    At least 8 characters with uppercase, lowercase, and a
                    number.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    required
                  />
                </Field>
              </FieldGroup>
            </>
          )}

          {step === 2 && (
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  required
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Bio</FieldLabel>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Profile Image</FieldLabel>
                <Input
                  className="pointer-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateField("profile-images", e.target.files[0] || null)
                  }
                />
              </Field>
            </FieldGroup>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-lg font-medium">Review Your Information</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Name:</strong> {formData.firstName}{" "}
                  {formData.lastName}
                </li>
                <li>
                  <strong>Email:</strong> {formData.email}
                </li>
                <li>
                  <strong>Username:</strong> {formData.username}
                </li>
                <li>
                  <strong>Bio:</strong> {formData.bio || "No bio provided"}
                </li>
                <li>
                  <strong>Image:</strong>{" "}
                  {formData["profile-images"]
                    ? formData["profile-images"].name
                    : "No file selected"}
                </li>
              </ul>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 mt-4">
              {typeof error === "string" ? error : "Registration failed"}
            </p>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button type="button" className="bg-primary text-white" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="button" className="bg-primary text-white" disabled={loading} onClick={handleSubmit}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
