import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    console.log("user", user);
    navigate("/");
  }

  return (
    <div className="p-8 mt-24 bg-white shadow-lg rounded-lg max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
      {user ? (
        <div>
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
