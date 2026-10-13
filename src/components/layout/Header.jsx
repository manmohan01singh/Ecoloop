import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf, Menu, X, LogOut, LayoutDashboard, User, Shield, Wrench, Recycle, Building2,
  Sparkles, ExternalLink, ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../context/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Badge } from '../ui';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/rescue', label: 'Rescue Engine', highlight: true },
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/repair', label: 'Repair' },
  { path: '/map', label: 'Waste Map' },
  { path: '/community', label: 'Community' },
  { path: '/challenges', label: 'Challenges' },
];

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleDashboard = (role) => {
    const map = {
      admin: '/admin',
      moderator: '/moderator',
      recycler: '/recycler',
      repair_provider: '/repair-provider',
      business: '/business-dashboard',
      organization: '/organization',
      user: '/dashboard'
    };
    return map[role] || '/dashboard';
  };

  const roleLabel = user?.role
    ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Member';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display leading-tight">
                EcoLoop
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider leading-none">
                Circular Tech
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_LINKS.map((link) => {
              const active = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'text-emerald-800 bg-emerald-50 font-bold border border-emerald-200/80 shadow-xs'
                      : link.highlight
                      ? 'text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Auth or Call-To-Action Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getRoleDashboard(user.role)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs text-slate-800"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                  <Badge variant="brand" size="sm">{roleLabel}</Badge>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-100">
            {NAV_LINKS.map((link) => {
              const active = link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 space-y-2">
            {user ? (
              <>
                <Link
                  to={getRoleDashboard(user.role)}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {roleLabel} Dashboard</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <User className="w-3.5 h-3.5" /> Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
