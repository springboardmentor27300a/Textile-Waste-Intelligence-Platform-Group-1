import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Administrator':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Recycling Facility Operator':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sustainability Manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Textile Manufacturer':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Brand/Logo */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-200">
            <Leaf className="h-5 w-5 animate-pulse" />
          </div>
          <span className="hidden text-xl font-bold bg-gradient-to-r from-primary-700 to-emerald-800 bg-clip-text text-transparent sm:block">
            Textile Waste Intelligence
          </span>
        </Link>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium mt-0.5 ${getRoleColor(user.role?.name)}`}>
                {user.role?.name || 'Guest'}
              </span>
            </div>
            
            <div className="h-8 w-px bg-slate-200"></div>

            {/* Profile Link Icon */}
            <Link 
              to="/profile" 
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-all"
              title="View Profile"
            >
              <UserIcon className="h-4.5 w-4.5" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 px-4 py-2 text-sm font-semibold transition-all border border-transparent hover:border-red-100"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
