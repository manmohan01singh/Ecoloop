import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, Suspense } from 'react';
import {
  Leaf, LayoutDashboard, Smartphone, BarChart3, Menu, X, LogOut,
  Users, Package, MapPin, Wrench, Trophy, Calendar, AlertTriangle,
  Building2, TrendingUp, Shield, Crown, Recycle, Settings, Star,
  Search, ChevronRight, HelpCircle, Sparkles, Award
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import { LoadingState, Badge } from '../ui';

// Grouped navigation for clear information architecture
const NAV_GROUPS = [
  {
    title: 'Core Activity',
    items: [
      { path: '/dashboard',   label: 'Overview',      icon: LayoutDashboard },
      { path: '/devices',     label: 'My Devices',    icon: Smartphone },
      { path: '/impact',      label: 'Carbon Impact', icon: BarChart3 },
      { path: '/eco-impact',  label: 'EcoKarma Ranks',icon: TrendingUp },
    ]
  },
  {
    title: 'Circular Solutions',
    items: [
      { path: '/rescue',      label: 'Rescue Engine', icon: Sparkles },
      { path: '/marketplace', label: 'Marketplace',   icon: Package },
      { path: '/repair',      label: 'Repair Network',icon: Wrench },
      { path: '/apply',       label: 'Apply for Pro Role', icon: Award },
      { path: '/map',         label: 'Waste Map',     icon: MapPin },
      { path: '/business',    label: 'B2B Exchange',  icon: Building2 },
    ]
  },
  {
    title: 'Civic & Community',
    items: [
      { path: '/community',   label: 'Discussions',   icon: Users },
      { path: '/challenges',  label: 'Challenges',    icon: Trophy },
      { path: '/events',      label: 'Events & Drives',icon: Calendar },
      { path: '/reports',     label: 'Waste Reports', icon: AlertTriangle },
      { path: '/reviews',     label: 'Reviews',       icon: Star },
    ]
  }
];

// Role-specific primary console links shown prominently at the top
const ROLE_NAV = {
  admin:           { path: '/admin',              label: 'Admin Control Center',   icon: Shield,   badge: 'Superuser' },
  organization:    { path: '/organization',        label: 'Organization Console',  icon: Building2,badge: 'Partner' },
  moderator:       { path: '/moderator',           label: 'Moderator Desk',        icon: Shield,   badge: 'Security' },
  recycler:        { path: '/recycler',            label: 'Facility Intake Hub',   icon: Recycle,  badge: 'Licensed' },
  repair_provider: { path: '/repair-provider',     label: 'Provider Workshop',     icon: Wrench,   badge: 'Technician' },
  business:        { path: '/business-dashboard',  label: 'Enterprise ESG Hub',    icon: Building2,badge: 'Commercial' },
};

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
        active
          ? 'bg-emerald-50 text-emerald-800 font-bold'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span className="truncate">{item.label}</span>
      </div>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />}
    </Link>
  );
}

function SidebarContent({ user, roleNav, location, onNav, onLogout }) {
  const roleLabel = user?.role
    ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Contributor';

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xs">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold text-gray-900 font-display leading-tight block">Circuvio</span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Circular Workspace</span>
          </div>
        </Link>
      </div>

      {/* Role Hub Card (if role has specialized console) */}
      {roleNav && (
        <div className="p-3 pb-1 flex-shrink-0">
          <Link
            to={roleNav.path}
            onClick={onNav}
            className={`block p-3 rounded-2xl border transition-all ${
              location.pathname.startsWith(roleNav.path)
                ? 'bg-emerald-900 border-emerald-800 text-white shadow-md'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 hover:bg-emerald-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Active Role Portal</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                location.pathname.startsWith(roleNav.path) ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {roleNav.badge}
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs">
              <roleNav.icon className="w-4 h-4" />
              <span className="truncate">{roleNav.label}</span>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation Group Sections */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {group.title}
            </p>
            {group.items.map((item) => {
              const active = item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

              return (
                <NavItem
                  key={item.path}
                  item={item}
                  active={active}
                  onClick={onNav}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Panel */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0 space-y-2 bg-gray-50/50">
        <Link
          to="/profile"
          onClick={onNav}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">
              {user?.name || 'Anonymous User'}
            </p>
            <p className="text-[10px] text-gray-500 truncate leading-tight capitalize mt-0.5">
              {roleLabel}
            </p>
          </div>
          <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </Link>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'user';
  const roleNav = ROLE_NAV[role] || null;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Compute breadcrumb title based on pathname
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/devices')) return 'Device Life-Cycle & Diagnostics';
    if (pathname.startsWith('/marketplace')) return 'Circular E-Waste Marketplace';
    if (pathname.startsWith('/repair')) return 'Verified Repair Network';
    if (pathname.startsWith('/map')) return 'Waste Banks & Drop-off Map';
    if (pathname.startsWith('/community')) return 'Circular Community Discussions';
    if (pathname.startsWith('/challenges')) return 'Eco Challenges & Contests';
    if (pathname.startsWith('/events')) return 'Community Cleanup Drives';
    if (pathname.startsWith('/impact')) return 'Environmental Carbon Offsets';
    if (pathname.startsWith('/eco-impact')) return 'EcoKarma Civic Leaderboard';
    if (pathname.startsWith('/business')) return 'B2B Circular Surplus Exchange';
    if (pathname.startsWith('/reports')) return 'Waste Hazard Reporting';
    if (pathname.startsWith('/reviews')) return 'Verified Partner Ratings';
    if (pathname.startsWith('/admin')) return 'Master Admin Control Panel';
    if (pathname.startsWith('/organization')) return 'Organization Management Console';
    if (pathname.startsWith('/moderator')) return 'Content & Safety Desk';
    if (pathname.startsWith('/recycler')) return 'Recycling Facility Intake';
    if (pathname.startsWith('/repair-provider')) return 'Repair Provider Hub';
    if (pathname.startsWith('/profile')) return 'Account Profile & Security';
    if (pathname.startsWith('/apply')) return 'Professional Role Application';
    return 'Citizen Workspace Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-30">
        <SidebarContent
          user={user}
          roleNav={roleNav}
          location={location}
          onNav={() => {}}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-white flex flex-col shadow-2xl h-full">
            <SidebarContent
              user={user}
              roleNav={roleNav}
              location={location}
              onNav={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Workspace Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Left: Mobile hamburger + Active Screen Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold text-gray-400">Circuvio</span>
              <ChevronRight className="hidden sm:inline-block w-3.5 h-3.5 text-gray-300" />
              <h1 className="text-sm font-bold text-gray-900 font-display">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          </div>

          {/* Right: User Profile Indicator */}
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-emerald-700 font-semibold capitalize leading-none">{role.replace('_', ' ')}</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 pb-16">
          <Suspense fallback={<LoadingState size="lg" fullPage />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
