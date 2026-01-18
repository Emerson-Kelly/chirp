import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterForm from "./pages/Register";
import LoginForm from "./pages/Login";
import HomePosts from "./pages/Home";
import NewPost from "./pages/NewPost";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Trending from "./pages/Trending";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";
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
  {
    path: "/search",
    element: (
      <>
        <StrictMode>
          <Search />
        </StrictMode>
      </>
    ),
  },
  {
    path: "/users/:id/profile",
    element: (
      <>
        <StrictMode>
          <Profile />
        </StrictMode>
      </>
    ),
  },
  {
    path: "/settings",
    element: (
      <>
        <StrictMode>
          <Settings />
        </StrictMode>
      </>
    ),
  },
  {
    path: "/trending",
    element: (
      <>
        <StrictMode>
          <Trending />
        </StrictMode>
      </>
    ),
  },
  {
    path: "/explore",
    element: (
      <>
        <StrictMode>
          <Explore />
        </StrictMode>
      </>
    ),
  },
  {
    path: "*",
    element: (
      <>
        <StrictMode>
          <NotFound />
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
