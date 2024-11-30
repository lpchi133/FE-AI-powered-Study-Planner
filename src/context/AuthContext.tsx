import React, { createContext, useState, useEffect } from "react";
// import useAxios from "../hooks/useAxios";
import axios from "axios";
import { toast } from "react-toastify";

// Define context types
interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  fetchProfile: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define AuthProvider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<User | null>(null);

  // Fetch user profile from the backend
  const fetchProfile = async () => {
    if (accessToken) {
      try {
        const response = await axios.get(
          "https://be-ai-powered-study-planner.vercel.app/users/profile",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout(); // Token expires then logout
          toast.error("Your session has expired. Please log in again.");
        }
      }
    }
  };

  // When accessToken changes, fetch user profile
  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    } else {
      setUser(null); // Clear user info when logged out
    }
  }, [accessToken]);

  const login = (token: string) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null); // Clear user information on logout
    localStorage.removeItem("accessToken");
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        user,
        login,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
