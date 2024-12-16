import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook để lấy route hiện tại
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 py-3 px-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
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
          </nav>
        )}

        {/* User profile / Auth links */}
        <div className="space-x-4 relative">
          {user ? (
            <div className="flex items-center">
              <span className="text-white mr-2 text-sm">
                Welcome, {user.name}!
              </span>
              <img
                src={user.profilePicture || "/images/avt.jpg"}
                alt="Profile"
                className="w-6 h-6 rounded-full cursor-pointer"
                onClick={toggleMenu}
              />
              {menuOpen && (
                <div
                  className="absolute right-0 w-40 bg-white rounded-md shadow-lg py-1 z-40"
                  style={{ marginTop: "9rem" }}
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Update Full Name
                  </Link>
                  <hr className="my-1" />
                  <Link
                    to="/update-profile-picture"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Update Profile Picture
                  </Link>
                  <hr className="my-1" />
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Change Password
                  </Link>
                </div>
              )}
              <span
                onClick={handleLogout}
                className="text-red-400 font-bold hover:opacity-50 transition duration-300 cursor-pointer ml-4 text-sm"
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
