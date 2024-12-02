import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const GoogleUser = () => {
  const { token = null } = useParams();
  const { login, user } = useAuth();
  console.log("user", user);
  if (token && !user) {
    console.log("token", token);
    login(token);
  }
  return <Navigate to="/" />;
};

export default GoogleUser;
