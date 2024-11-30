import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

interface UserProfile {
  email: string;
  name: string;
}
const Profile = () => {
  const { logout } = useAuth();
  const axiosInstance = useAxios();

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/users/profile");
        setUserData(response.data); // Store user data in state
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "An error occurred"
          );
        } else {
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Display loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Display error if any
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-8 mt-24 bg-white shadow-lg rounded-lg max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
      {userData ? (
        <div>
          <div className="mb-6">
            <p className="font-semibold text-lg">Full Name:</p>
            <p className="text-gray-700">{userData.name}</p>
          </div>
          <div className="mb-4">
            <p className="font-semibold text-lg">Email:</p>
            <p className="text-gray-700">{userData.email}</p>
          </div>

          {/* Centered buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Back to Home
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default Profile;
