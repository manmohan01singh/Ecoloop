import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Leaf, LayoutDashboard, Smartphone, BarChart3, Menu, X, LogOut, User, Users, Package, MapPin, Wrench, Trophy, Calendar, AlertTriangle, Building2, TrendingUp, Shield, Crown } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import { useTranslation } from '../../hooks/useTranslation';

const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/devices', labelKey: 'nav.devices', icon: Smartphone },
  { path: '/impact', labelKey: 'nav.impact', icon: BarChart3 },
  { path: '/community', labelKey: 'nav.community', icon: Users },
  { path: '/marketplace', labelKey: 'nav.marketplace', icon: Package },
  { path: '/map', labelKey: 'nav.map', icon: MapPin },
  { path: '/repair', labelKey: 'nav.repair', icon: Wrench },
  { path: '/challenges', labelKey: 'nav.challenges', icon: Trophy },
  { path: '/events', labelKey: 'nav.events', icon: Calendar },
  { path: '/reports', labelKey: 'nav.reports', icon: AlertTriangle },
  { path: '/business', labelKey: 'nav.business', icon: Building2 },
  { path: '/eco-impact', labelKey: 'nav.ecoImpact', icon: TrendingUp },
];

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isOrganization = user?.role === 'organization';
  
  // Determine theme based on role
  const themeColor = isAdmin ? 'red' : isOrganization ? 'indigo' : 'emerald';
  const themeBorder = isAdmin ? 'border-red-200' : isOrganization ? 'border-indigo-200' : 'border-gray-200';
  const themeBg = isAdmin ? 'bg-red-50' : isOrganization ? 'bg-indigo-50' : 'bg-gray-50';
  const themeText = isAdmin ? 'text-red-600' : isOrganization ? 'text-indigo-600' : 'text-emerald-600';
  const themeHover = isAdmin ? 'hover:bg-red-50 hover:text-red-700' : isOrganization ? 'hover:bg-indigo-50 hover:text-indigo-700' : 'hover:bg-emerald-50 hover:text-emerald-700';

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col w-64 bg-white border-r fixed inset-y-0 ${themeBorder}`}>
        <div className={`flex items-center gap-2 px-6 h-16 border-b ${themeBorder} ${themeBg}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-red-600' : isOrganization ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
            {isAdmin ? <Crown className="w-5 h-5 text-white" /> : isOrganization ? <Building2 className="w-5 h-5 text-white" /> : <Leaf className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <span className="text-xl font-bold text-gray-900">EcoLoop</span>
            {isAdmin && <span className="block text-xs font-medium text-red-600">Admin Mode</span>}
            {isOrganization && <span className="block text-xs font-medium text-indigo-600">Organization</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {t(item.labelKey)}
            </a>
          ))}
          
          {/* Admin Panel - Only for admins */}
          {isAdmin && (
            <a
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border-t mt-3 pt-3"
            >
              <Shield className="w-5 h-5" />
              {t('nav.admin')}
            </a>
          )}
          
          {/* Organization Dashboard - Only for organizations */}
          {isOrganization && (
            <a
              href="/organization"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t mt-3 pt-3"
            >
              <Building2 className="w-5 h-5" />
              Organization Dashboard
            </a>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-100' : isOrganization ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
              {isAdmin ? <Crown className="w-5 h-5 text-red-600" /> : isOrganization ? <Building2 className="w-5 h-5 text-indigo-600" /> : <User className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</div>
              <div className="flex items-center gap-1">
                <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                {isAdmin && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Admin</span>
                )}
                {isOrganization && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">Org</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative w-64 bg-white border-r flex flex-col ${themeBorder}`}>
            <div className={`flex items-center justify-between px-6 h-16 border-b ${themeBorder} ${themeBg}`}>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-red-600' : isOrganization ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                  {isAdmin ? <Crown className="w-5 h-5 text-white" /> : isOrganization ? <Building2 className="w-5 h-5 text-white" /> : <Leaf className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <span className="text-xl font-bold text-gray-900">EcoLoop</span>
                  {isAdmin && <span className="block text-xs font-medium text-red-600">Admin Mode</span>}
                  {isOrganization && <span className="block text-xs font-medium text-indigo-600">Organization</span>}
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </a>
              ))}
              
              {/* Admin Panel - Only for admins */}
              {isAdmin && (
                <a
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border-t mt-3 pt-3"
                >
                  <Shield className="w-5 h-5" />
                  {t('nav.admin')}
                </a>
              )}
              
              {/* Organization Dashboard - Only for organizations */}
              {isOrganization && (
                <a
                  href="/organization"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t mt-3 pt-3"
                >
                  <Building2 className="w-5 h-5" />
                  Organization Dashboard
                </a>
              )}
            </nav>

            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-100' : isOrganization ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                  {isAdmin ? <Crown className="w-5 h-5 text-red-600" /> : isOrganization ? <Building2 className="w-5 h-5 text-indigo-600" /> : <User className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                    {isAdmin && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Admin</span>
                    )}
                    {isOrganization && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">Org</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                {t('nav.logout')}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className={`sticky top-0 z-40 bg-white border-b h-16 flex items-center justify-between px-6 lg:px-8 ${themeBorder} ${isAdmin ? 'bg-red-50/30' : isOrganization ? 'bg-indigo-50/30' : ''}`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-red-600' : isOrganization ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {isAdmin ? <Crown className="w-4 h-4 text-white" /> : isOrganization ? <Building2 className="w-4 h-4 text-white" /> : <Leaf className="w-4 h-4 text-white" />}
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">EcoLoop</span>
                {isAdmin && <span className="block text-xs font-medium text-red-600 -mt-1">Admin</span>}
                {isOrganization && <span className="block text-xs font-medium text-indigo-600 -mt-1">Org</span>}
              </div>
            </div>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="hidden lg:flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">Admin Mode</span>
              </div>
            )}
            {isOrganization && (
              <div className="hidden lg:flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Organization</span>
              </div>
            )}
            
            {/* User info - visible on all screens */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isAdmin ? 'bg-red-100' : isOrganization ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                {isAdmin ? <Crown className="w-4 h-4 text-red-600" /> : isOrganization ? <Building2 className="w-4 h-4 text-indigo-600" /> : <User className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-medium text-gray-900">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'user'}</div>
              </div>
            </div>

            {/* Logout button - always visible */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{t('nav.logout')}</span>
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
