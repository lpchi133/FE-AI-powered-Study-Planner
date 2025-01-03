import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import useAxios from "../../hooks/useAxios";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const { logout, user, fetchProfile } = useAuth();
  const { post, put } = useAxios();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || "/images/avt.jpg"
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  if (!user) {
    navigate("/");
    return null;
  }

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);

      try {
        const response = await post("/users/changeAvt", formData, {
          "Content-Type": "multipart/form-data",
        });

        if (response?.success) {
          const profilePictureUrl = `${
            response.profilePictureUrl
          }?${new Date().getTime()}`;
          setProfilePicture(profilePictureUrl);
          fetchProfile();
        } else {
          console.error("Failed to update profile picture");
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await put("/users/update", editFormData);

      if (response?.success) {
        // Update user data in the state
        // Assuming you have a method to update user data in your auth context
        // updateUser(response.data.user);
        setIsEditModalOpen(false);
        // setPasswordFormData('', '');
        fetchProfile();
      } else {
        console.error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (
      value != "" &&
      name === "newPassword" &&
      value === passwordFormData.currentPassword
    ) {
      setPasswordError(
        "New password cannot be the same as the current password"
      );
    } else if (
      value != "" &&
      name === "currentPassword" &&
      value === passwordFormData.newPassword
    ) {
      setPasswordError(
        "New password cannot be the same as the current password"
      );
    }

    if (
      value != "" &&
      name === "newPassword" &&
      value === passwordFormData.currentPassword
    ) {
      setPasswordError(
        "New password cannot be the same as the current password"
      );
    } else if (
      value != "" &&
      name === "currentPassword" &&
      value === passwordFormData.newPassword
    ) {
      setPasswordError(
        "New password cannot be the same as the current password"
      );
    } else {
      setPasswordError("");
    }
  };

  const resetPasswordForm = () => {
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
    });
    setPasswordError("");
  };

  const handlePasswordChangeSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (user.checkAccountGG) {
      try {
        const response = await put("/users/changePassword", {
          currentPassword: "",
          newPassword: passwordFormData.newPassword,
        });

        if (response?.success) {
          setIsPasswordModalOpen(false);
          toast.success("Change Password Successful!");
          fetchProfile();
          resetPasswordForm();
        } else {
          setPasswordError(
            response.data.message ||
              response.data.message[0] ||
              "Failed to change password"
          );
        }
      } catch (error) {
        console.error("Error changing password", error);
        setPasswordError("Error changing password");
      }
      return;
    }

    if (
      passwordFormData.currentPassword != "" &&
      passwordFormData.currentPassword === passwordFormData.newPassword
    ) {
      setPasswordError(
        "New password cannot be the same as the current password"
      );
      return;
    }

    try {
      const response = await put("/users/changePassword", passwordFormData);

      // Kiểm tra `response.success` thay vì `response.data.success`
      if (response?.success) {
        setIsPasswordModalOpen(false);
        toast.success("Change Password Successful!");
        fetchProfile();
        resetPasswordForm();
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setPasswordError(
          error.response.data.message ||
            error.response.data.message[0] ||
            "Failed to change password"
        );
      } else {
        setPasswordError("Failed to change password");
      }
    }
  };

  return (
    <div className="p-8 mt-24 bg-white shadow-lg rounded-lg max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
      {user ? (
        <div>
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
          <div className="mb-4">
            <div
              className="flex items-center justify-between text-gray-700 cursor-pointer hover:text-blue-600 font-semibold text-lg"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <span>Change Password</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 26 26"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.247 4.341a1 1 0 0 1 1.412-.094l8 7a1 1 0 0 1 0 1.506l-8 7a1 1 0 0 1-1.318-1.506L14.482 12l-7.14-6.247a1 1 0 0 1-.094-1.412z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Back to Home
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300"
            >
              Edit
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

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  readOnly
                  // onChange={handleEditChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChangeSubmit}>
              {passwordError && (
                <div className="mb-4 text-red-600">{passwordError}</div>
              )}
              {!user.checkAccountGG && (
                <div className="mb-4">
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    resetPasswordForm();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
