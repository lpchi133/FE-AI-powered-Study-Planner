import axios from "axios";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

const useAxios = () => {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: import.meta.env.VITE_ENDPOINT_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Interceptor to handle expired tokens
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout(); // Token expires then logout
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
