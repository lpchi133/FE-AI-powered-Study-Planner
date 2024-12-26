import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import Header from "../Header";
import { TaskProvider } from "../../hooks/useTasksContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while AuthContext is initializing
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Header />
      <TaskProvider>
        <Outlet />
      </TaskProvider>
    </div>
  );
};

export default ProtectedRoute;
