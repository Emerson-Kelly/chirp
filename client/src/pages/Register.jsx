import MultiStepSignupForm from "../components/chirp/signup-form.jsx";

export default function RegisterForm() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <MultiStepSignupForm />
      </div>
    </div>
  );
}
