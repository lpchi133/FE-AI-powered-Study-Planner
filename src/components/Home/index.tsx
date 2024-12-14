import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Welcome to the Homepage</h1>
      {!user ? (
        <div className="space-x-4">
          <Link to="/login">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              Register
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-x-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
          <Link to="/profile">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Profile
            </button>
          </Link>
          <Link to="/view-tasks">
            <button className="bg-purple-500 text-white px-4 py-2 rounded">
              View Tasks
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};


export default Home;
