import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false); // State để toggle menu

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 py-3 px-4 shadow-md z-50">
      <div className="mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-white font-bold text-lg overflow-hidden whitespace-nowrap text-ellipsis flex">
          <Link to="/" className="text-white-important">
            AI-powered Study Planner
          </Link>

          {/* Menu icon for mobile */}
          <button
            className="text-white md:hidden focus:outline-none ml-8"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {user && (
          <>
            {/* Navigation links */}
            <nav
              className={`${
                menuOpen ? "block" : "hidden"
              } md:flex md:space-x-4 md:static absolute bg-blue-600 md:bg-transparent top-full left-0 w-full md:w-auto z-40`}
            >
              <div className="flex flex-col md:flex-row md:space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 h-full flex items-center rounded-md ${
                    location.pathname === "/"
                      ? "bg-blue-500 text-white font-bold underline"
                      : "text-white hover:bg-blue-700 no-underline"
                  }`}
                >
                  Tasks
                </Link>
                <Link
                  to="/calendar"
                  className={`px-3 py-2 h-full flex items-center rounded-md ${
                    location.pathname === "/calendar"
                      ? "bg-blue-500 text-white font-bold underline"
                      : "text-white hover:bg-blue-700 no-underline"
                  }`}
                >
                  Calendar
                </Link>
                <Link
                  to="/ai_chat_box"
                  className={`px-3 py-2 h-full flex items-center rounded-md ${
                    location.pathname === "/ai_chat_box"
                      ? "bg-blue-500 text-white font-bold underline"
                      : "text-white hover:bg-blue-700 no-underline"
                  }`}
                >
                  AI Chat Box
                </Link>
                <Link
                  to="/analytics"
                  className={`px-3 py-2 h-full flex items-center rounded-md ${
                    location.pathname === "/analytics"
                      ? "bg-blue-500 text-white font-bold underline"
                      : "text-white hover:bg-blue-700 no-underline"
                  }`}
                >
                  Analytics
                </Link>
              </div>
            </nav>
          </>
        )}

        {/* User profile / Auth links */}
        <div className="space-x-4 relative ml-2">
          {user ? (
            <div className="flex items-center">
              <span className="hidden lg:inline text-white mr-2 ml-4 overflow-hidden whitespace-nowrap text-ellipsis">
                Welcome, <span className="font-bold">{user.name}</span>!
              </span>
              <Link to="/profile">
                <img
                  src={user.profilePicture || "/images/avt.jpg"}
                  alt="Profile"
                  className="hidden custom1:inline w-8 h-8 rounded-full cursor-pointer"
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
