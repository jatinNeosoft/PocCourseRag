import { getToken } from "@/lib/utils";
import { Navigate } from "react-router-dom";


export default function AuthGuard({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
