import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';  
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();  
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          <Link to="/" className="text-white-important">AI-powered Study Planner</Link>
        </div>

        {/* Menu */}
        <div className="space-x-4 relative">
          {/* If the user is logged in */}
          {user ? (
            <div className="flex items-center relative">
              <span className="text-white mr-2">Welcome, {user.name}!</span>
              <img
                src={user.profilePicture || '/images/avt.jpg'} // Replace with the path to your default profile picture
                alt="Profile"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={toggleMenu}
              />
              {menuOpen && (
                <div
                  className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 z-40"
                  style={{ marginTop: '11.4rem' }}
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
                className="text-red-400 font-bold hover:opacity-50 transition duration-300 cursor-pointer ml-4"
              >
                Logout
              </span>
            </div>
          ) : (
            // If the user is not logged in
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-gray-300 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white hover:text-gray-300 transition duration-300"
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
