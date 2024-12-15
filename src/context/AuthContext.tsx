import React, { useState, useEffect } from "react";
// import useAxios from "../hooks/useAxios";
import axios from "axios";
import { toast } from "react-toastify";

// Define context types
interface User {
  id: number;
  name: string;
  email: string;
  profilePicture: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  fetchProfile: () => void;
  loading: boolean; // Add loading state
}

// Create AuthContext
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Define AuthProvider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchProfile = async () => {
    if (accessToken) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_ENDPOINT_URL}/users/profile`,
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
          logout(); 
          toast.error("Your session has expired. Please log in again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    } else {
      setLoading(false); // No token means we're done loading
    }
  }, [accessToken]);

  const login = (token: string) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        login,
        logout,
        fetchProfile,
        loading, // Expose loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
export type { AuthContextType };