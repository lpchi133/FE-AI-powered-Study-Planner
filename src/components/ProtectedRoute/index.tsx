import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while AuthContext is initializing
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
