import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, logout } = useAuth();

  // If not logged in, redirect to login page
  if (!user) {
    logout();
    return <Navigate to="/login" />;
  }

  // If logged in, display the route content
  return <Outlet />;
};

export default ProtectedRoute;
