import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';  

export default function Header() {
  const { user, logout } = useAuth();  
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          <Link to="/">AI-powered Study Planner</Link>
        </div>

        {/* Menu */}
        <div className="space-x-4">
          {/* If the user is logged in */}
          {user ? (
            <div className="flex items-center">
              <span className="text-white mr-12">Welcome, {user.name}!</span>
              <span
                onClick={handleLogout}
                className="text-red-400 font-bold hover:opacity-50 transition duration-300"
              >
                Logout
              </span>
            </div>
          ) : (
            //If the user is not logged in
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
