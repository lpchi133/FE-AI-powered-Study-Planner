import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const GoogleUser = () => {
  const { token = null } = useParams();
  const { login, user } = useAuth();
  if (token && !user) {
    login(token);
  }
  return <Navigate to="/" />;
};

export default GoogleUser;
