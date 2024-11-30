import axios from 'axios';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const useAxios = () => {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: 'https://be-ai-powered-study-planner.vercel.app',
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
        toast.error("Your session has expired. Please log in again.");
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
