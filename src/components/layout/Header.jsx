import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../context/authStore';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              EcoLoop
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#impact" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Impact</a>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-105 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-emerald-50 px-4 py-4 space-y-3">
          <Link to="/" className="block py-2 text-gray-600 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="#features" className="block py-2 text-gray-600 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Features</a>
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2 text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block py-2 text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
