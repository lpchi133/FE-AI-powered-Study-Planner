import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook để lấy route hiện tại

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 left-0 w-full bg-blue-600 py-3 px-4 shadow-md z-50">
      <div className=" mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white font-bold text-lg">
          <Link to="/" className="text-white-important">
            AI-powered Study Planner
          </Link>
        </div>

        {/* Menu điều hướng */}
        {user && (
          <nav className="flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/"
                  ? "bg-blue-500 text-white font-bold underline"
                  : "text-white hover:bg-blue-700 no-underline"
              }`}
            >
              Tasks
            </Link>
            <Link
              to="/calendar"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/calendar"
                  ? "bg-blue-500 text-white font-bold underline"
                  : "text-white hover:bg-blue-700 no-underline"
              }`}
            >
              Calendar
            </Link>
            <Link
              to="/ai_chat_box"
              className={`px-3 py-1 rounded-md ${
                location.pathname === "/ai_chat_box"
                  ? "bg-blue-500 text-white font-bold underline"
                  : "text-white hover:bg-blue-700 no-underline"
              }`}
            >
              AI Chat Box
            </Link>
          </nav>
        )}

        {/* User profile / Auth links */}
        <div className="space-x-4 relative">
          {user ? (
            <div className="flex items-center">
              <span className="text-white mr-2">
                Welcome, <span className="font-bold">{user.name}</span>!
              </span>
              <Link to="/profile">
                <img
                  src={user.profilePicture || "/images/avt.jpg"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </Link>

              <span
                onClick={handleLogout}
                className="text-red-400 font-bold hover:opacity-50 transition duration-300 cursor-pointer ml-6"
              >
                Logout
              </span>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-gray-300 transition duration-300 text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white hover:text-gray-300 transition duration-300 text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
