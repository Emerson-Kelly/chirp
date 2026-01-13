import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterForm from "./pages/Register";
import LoginForm from "./pages/Login";
import HomePosts from "./pages/Home";
import NewPost from "./pages/NewPost";
import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter([
  {
    path: "register",
    element: (
      <>
        <StrictMode>
          <RegisterForm />
        </StrictMode>
      </>
    ),
  },
  {
    path: "login",
    element: (
      <>
        <StrictMode>
          <LoginForm />
        </StrictMode>
      </>
    ),
  },
  {
    path: "/",
    element: (
      <>
        <StrictMode>
          <HomePosts />
        </StrictMode>
      </>
    ),
  },
  {
    path: "/new-post",
    element: (
      <>
        <StrictMode>
          <NewPost />
        </StrictMode>
      </>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
