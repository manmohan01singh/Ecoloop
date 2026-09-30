import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Leaf, LayoutDashboard, Smartphone, BarChart3, Menu, X, LogOut,
  Users, Package, MapPin, Wrench, Trophy, Calendar, AlertTriangle,
  Building2, TrendingUp, Shield, Crown, Recycle, Settings, Star
} from 'lucide-react';
import useAuthStore from '../../context/authStore';

// Nav visible to ALL authenticated users
const BASE_NAV = [
  { path: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/devices',     label: 'My Devices',   icon: Smartphone },
  { path: '/impact',      label: 'Impact',       icon: BarChart3 },
  { path: '/community',   label: 'Community',    icon: Users },
  { path: '/marketplace', label: 'Marketplace',  icon: Package },
  { path: '/map',         label: 'Resource Map', icon: MapPin },
  { path: '/repair',      label: 'Repair',       icon: Wrench },
  { path: '/challenges',  label: 'Challenges',   icon: Trophy },
  { path: '/events',      label: 'Events',       icon: Calendar },
  { path: '/reports',     label: 'Reports',      icon: AlertTriangle },
  { path: '/business',    label: 'B2B Exchange', icon: Building2 },
  { path: '/eco-impact',  label: 'EcoKarma',     icon: TrendingUp },
  { path: '/reviews',    label: 'Reviews',      icon: Star },
];

// Role-specific hub links shown at the TOP of the sidebar
const ROLE_NAV = {
  admin:           [{ path: '/admin',              label: 'Admin Panel',    icon: Shield }],
  organization:    [{ path: '/organization',        label: 'Org Dashboard',  icon: Building2 }],
  moderator:       [{ path: '/moderator',           label: 'Mod Dashboard',  icon: Shield }],
  recycler:        [{ path: '/recycler',            label: 'Recycler Hub',   icon: Recycle }],
  repair_provider: [{ path: '/repair-provider',     label: 'Provider Hub',   icon: Wrench }],
  business:        [{ path: '/business-dashboard',  label: 'Business Hub',   icon: Building2 }],
};

// Per-role colour theme
const ROLE_THEME = {
  admin:           { border: 'border-red-200',    bg: 'bg-red-50',    text: 'text-red-600',    activeBg: 'bg-red-50',    activeText: 'text-red-700',    icon: Crown,     iconBg: 'bg-red-600' },
  organization:    { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-50', activeText: 'text-indigo-700', icon: Building2, iconBg: 'bg-indigo-600' },
  moderator:       { border: 'border-blue-200',   bg: 'bg-blue-50',   text: 'text-blue-600',   activeBg: 'bg-blue-50',   activeText: 'text-blue-700',   icon: Shield,    iconBg: 'bg-blue-600' },
  recycler:        { border: 'border-green-200',  bg: 'bg-green-50',  text: 'text-green-600',  activeBg: 'bg-green-50',  activeText: 'text-green-700',  icon: Recycle,   iconBg: 'bg-green-600' },
  repair_provider: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', activeBg: 'bg-orange-50', activeText: 'text-orange-700', icon: Wrench,    iconBg: 'bg-orange-600' },
  business:        { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-50', activeText: 'text-indigo-700', icon: Building2, iconBg: 'bg-indigo-600' },
  user:            { border: 'border-gray-200',   bg: 'bg-gray-50',   text: 'text-emerald-600',activeBg: 'bg-emerald-50',activeText: 'text-emerald-700',icon: Leaf,      iconBg: 'bg-emerald-600' },
};

function NavLink({ item, active, theme, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${active
          ? `${theme.activeBg} ${theme.activeText} font-semibold`
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
    </Link>
  );
}

function SidebarContent({ user, theme, roleNav, location, onNav, onLogout }) {
  const ThemeIcon = theme.icon;
  const roleLabel = user?.role
    ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'User';

  return (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2 px-5 h-16 border-b ${theme.border} ${theme.bg} flex-shrink-0`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.iconBg}`}>
          <ThemeIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-lg font-bold text-gray-900">EcoLoop</span>
          <span className={`block text-xs font-medium truncate ${theme.text}`}>{roleLabel}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {/* Role hub links at top */}
        {roleNav.length > 0 && (
          <>
            {roleNav.map(item => (
              <NavLink key={item.path} item={item}
                active={location.pathname === item.path}
                theme={theme} onClick={onNav} />
            ))}
            <div className="my-2 border-t border-gray-100" />
          </>
        )}

        {/* Common nav */}
        {BASE_NAV.map(item => (
          <NavLink key={item.path} item={item}
            active={item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path)}
            theme={theme} onClick={onNav} />
        ))}

        {/* Profile */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <NavLink
            item={{ path: '/profile', label: 'My Profile', icon: Settings }}
            active={location.pathname === '/profile'}
            theme={theme} onClick={onNav} />
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-1">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme.bg}`}>
              <span className={`text-sm font-bold ${theme.text}`}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'user';
  const theme = ROLE_THEME[role] || ROLE_THEME.user;
  const roleNav = ROLE_NAV[role] || [];
  const ThemeIcon = theme.icon;

  const handleLogout = () => { logout(); window.location.href = '/'; };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 bg-white border-r fixed inset-y-0 ${theme.border}`}>
        <SidebarContent user={user} theme={theme} roleNav={roleNav} location={location}
          onNav={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative z-10 w-64 bg-white border-r flex flex-col ${theme.border}`}>
            <SidebarContent user={user} theme={theme} roleNav={roleNav} location={location}
              onNav={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className={`sticky top-0 z-40 bg-white border-b h-16 flex items-center justify-between px-4 lg:px-6 ${theme.border}`}>
          {/* Left: hamburger + logo (mobile) */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900">
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${theme.iconBg}`}>
                <ThemeIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">EcoLoop</span>
            </div>
          </div>

          {/* Right: profile chip + logout */}
          <div className="flex items-center gap-2">
            <Link to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme.bg}`}>
                  <span className={`text-xs font-bold ${theme.text}`}>
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-900 leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize leading-tight">{role.replace('_', ' ')}</p>
              </div>
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200 text-sm font-medium">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main><Outlet /></main>
      </div>
    </div>
  );
}
