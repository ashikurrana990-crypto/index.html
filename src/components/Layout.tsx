import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Home, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isAffiliate } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
            Grabify<span className="text-gray-900">Store</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Home</Link>
            {user ? (
              <>
                {(isAdmin || isAffiliate) && (
                  <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-medium">Admin</Link>
                )}
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
            )}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        <Link to="/" className="flex flex-col items-center text-gray-600">
          <Home size={24} />
          <span className="text-[10px] mt-1">Home</span>
        </Link>
        {(isAdmin || isAffiliate) && (
          <Link to="/dashboard" className="flex flex-col items-center text-gray-600">
            <LayoutDashboard size={24} />
            <span className="text-[10px] mt-1">Dashboard</span>
          </Link>
        )}
        <Link to="/cart" className="flex flex-col items-center text-gray-600">
          <ShoppingCart size={24} />
          <span className="text-[10px] mt-1">Cart</span>
        </Link>
        <Link to={user ? "/dashboard" : "/login"} className="flex flex-col items-center text-gray-600">
          <User size={24} />
          <span className="text-[10px] mt-1">{user ? 'Profile' : 'Login'}</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
