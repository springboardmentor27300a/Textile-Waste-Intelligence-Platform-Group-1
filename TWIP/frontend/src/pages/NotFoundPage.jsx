import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-100/50 space-y-6">
        
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 animate-bounce">
            <Leaf className="h-10 w-10 rotate-45" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-800 tracking-tight">404</h1>
          <h3 className="text-lg font-bold text-slate-800">Resource Not Found</h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            The page you are looking for does not exist, has been removed, or is currently undergoing recycling audits.
          </p>
        </div>

        {/* Back Button */}
        <div className="pt-2">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 text-sm w-full justify-center"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Return to Safety</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
