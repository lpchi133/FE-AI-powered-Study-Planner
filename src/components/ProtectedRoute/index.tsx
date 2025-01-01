import { useAuth } from "../../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import { TaskProvider } from "../../hooks/useTasksContext";
import { TimerProvider } from "../../hooks/useTimerContext";

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
      <TimerProvider>
        <TaskProvider>
          <Outlet />
        </TaskProvider>
      </TimerProvider>
    </div>
  );
};

export default ProtectedRoute;
