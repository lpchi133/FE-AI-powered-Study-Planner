import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const useAxios = () => {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: import.meta.env.VITE_ENDPOINT_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      // Do something before request is sent
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );

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

  const post = async (url: string, data: unknown, headers?: object) => {
    try {
      const response = await instance.post(url, data, {
        headers: {
          ...(headers || {}),
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error post", error);
      throw error;
    }
  };
  const get = async (url: string, headers?: object) => {
    try {
      const response = await instance.get(url, {
        headers: {
          ...(headers || {}),
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error get", error);
      throw error;
    }
  };
  const put = async (url: string, data: unknown, headers?: object) => {
    try {
      const response = await instance.put(url, data, {
        headers: {
          ...(headers || {}),
        },
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error post", error);
      throw error;
    }
  };

  return {
    instance,
    post,
    get,
    put,
  };
};

export default useAxios;
