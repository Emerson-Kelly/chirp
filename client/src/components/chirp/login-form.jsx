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
import useLogin from "../../hooks/useLogin.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { loginUser, loading, error } = useLogin();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  function updateField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await loginUser(formData);

    /*
    if (result?.token) {
      console.log("JWT received:", result.token);
    }
    */

    if (res?.token) {
      login(res.token);
      navigate("/");
    }
  }

  return (
    <Card className="w-full max-w-xl m-auto p-6 rounded-2xl shadow-md">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="pb-2">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-1">
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-1 pt-6">
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-1 pt-6">
              <Button type="button" className="bg-primary text-white" disabled={loading} onClick={handleSubmit}>
                {loading ? "Logging In..." : "Login"}
              </Button>
            </FieldGroup>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-1">
              {error && (
                <p className="text-sm text-red-500 mt-4">
                  {typeof error === "string" ? error : "Login failed"}
                </p>
              )}
            </FieldGroup>
          </>
        </CardContent>
      </form>
    </Card>
  );
}
