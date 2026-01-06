import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterForm from "./pages/Register";
import LoginForm from "./pages/Login";
import HomeFeed from './pages/Home';

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "register",
    element: (
      <>
          <StrictMode>
          <RegisterForm/>
          </StrictMode>
      </>
    ),
  },
  {
    path: "login",
    element: (
      <>
          <StrictMode>
          <LoginForm/>
          </StrictMode>
      </>
    ),
  },
  {
    path: "/",
    element: (
      <>
          <StrictMode>
          <HomeFeed/>
          </StrictMode>
      </>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
