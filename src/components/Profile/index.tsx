import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import axios from "axios";

const Profile = () => {
  const { logout, user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '/images/avt.jpg');
  console.log("accessToken:", accessToken);
  if (!user) {
    console.log("user", user);
    navigate("/");
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Log the file URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          console.log('Selected file URL:', reader.result);
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);

      try {
        const response = await axios.post(`${import.meta.env.VITE_ENDPOINT_URL}/users/changeAvt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          // Thêm chuỗi truy vấn ngẫu nhiên để làm mới URL
          const profilePictureUrl = `${response.data.profilePictureUrl}?${new Date().getTime()}`;
          setProfilePicture(profilePictureUrl);
        } else {
          console.error('Failed to update profile picture');
        }
      } catch (error: unknown) {
        console.error('Error uploading profile picture:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
          console.error('Response headers:', error.response?.headers);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    }
  };

  return (
    <div className="p-8 mt-24 bg-white shadow-lg rounded-lg max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
      {user ? (
        <div>
          {/* User Avatar */}
          <div className="flex justify-center mb-6">
            <label htmlFor="profilePictureInput">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full cursor-pointer"
              />
            </label>
            <input
              id="profilePictureInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>
          <div className="mb-6">
            <p className="font-semibold text-lg">Full Name:</p>
            <p className="text-gray-700">{user.name}</p>
          </div>
          <div className="mb-4">
            <p className="font-semibold text-lg">Email:</p>
            <p className="text-gray-700">{user.email}</p>
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