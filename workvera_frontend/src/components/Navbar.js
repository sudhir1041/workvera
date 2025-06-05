import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { LogOut, User, Briefcase, LayoutDashboard, BookOpen, Users as UsersIconLucide } from 'lucide-react'; 
// import workVeraLogo from './path/to/your/logo.png'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); 
  };

  return (
    <nav className="bg-teal-700 text-white shadow-lg sticky top-0 z-50"> 
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center" title="WorkVera Home">
            <img 
              src="/workvera-logo-transparent.png" 
              alt="WorkVera Logo" 
              className="h-8 md:h-10 w-auto" 
              onError={(e) => { 
                e.target.onerror = null; 
                // e.target.style.display='none'; // Hide broken image
                // Fallback to text if image fails or for screen readers if alt text is not enough
                const textFallback = document.createElement('span');
                textFallback.className = "text-2xl font-bold";
                textFallback.textContent = "WorkVera";
                e.target.parentNode.replaceChild(textFallback, e.target);
              }}
            />
          </Link>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/jobs" className="px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center">
              <Briefcase size={18} className="mr-0 md:mr-1" /> <span className="hidden md:inline">Jobs</span>
            </Link>
            <Link to="/skill-tests" className="px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center">
              <BookOpen size={18} className="mr-0 md:mr-1" /> <span className="hidden md:inline">Skill Tests</span>
            </Link>
            <Link to="/forum" className="px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center">
              <UsersIconLucide size={18} className="mr-0 md:mr-1" /> <span className="hidden md:inline">Community</span>
            </Link> 
            
            {user && user.is_staff && ( 
                <Link 
                  to="/admin/users" 
                  className="px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center"
                  title="User Management"
                >
                  <UsersIconLucide size={18} className="mr-0 md:mr-1" /> 
                  <span className="hidden md:inline">Manage Users</span>
                </Link>
              )}

            {user ? (
              <>
                <Link to="/dashboard" className="px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center">
                  <LayoutDashboard size={18} className="mr-0 md:mr-1" /> <span className="hidden md:inline">Dashboard</span>
                </Link>
                {user.role === 'seeker' && (
                  <Link to="/profile" className="px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors flex items-center">
                    <User size={18} className="mr-0 md:mr-1" /> <span className="hidden md:inline">Profile</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  title={`Logout (${user.name || user.email})`}
                  className="bg-red-500 hover:bg-red-600 px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <LogOut size={18} className="mr-0 md:mr-1" /> <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-green-500 hover:bg-green-600 px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-500 hover:bg-orange-600 px-2 py-1 md:px-3 md:py-2 rounded-md text-sm font-medium transition-colors" // Matched your previous update
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
