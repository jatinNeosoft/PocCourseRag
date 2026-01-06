import { createBrowserRouter } from "react-router-dom";

import CourseSelect from "@/pages/CourseSelect";
import AuthGuard from "./auth/AuthGuard";
import Login from "./auth/Login";
import VerifyOtp from "./auth/VerifyOtp";
import Chat from "./pages/Chat";


export const router = createBrowserRouter([
  {
    path: "/",
    element: (
            <AuthGuard>
                  <CourseSelect />
            </AuthGuard>
            )
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/chat/:courseId",
    element: (
      <AuthGuard>
        <Chat />
      </AuthGuard>
    ),
  },
]);
