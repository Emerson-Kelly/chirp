import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterForm from "./pages/Register";


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
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
