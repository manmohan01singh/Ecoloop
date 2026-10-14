import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import useAuthStore from './context/authStore';
import { LanguageProvider } from './context/LanguageContext';
import EWasteChatbot from './components/EWasteChatbot';
import { LoadingState } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded routes for optimal initial paint and bundle splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Devices = lazy(() => import('./pages/Devices'));
const DeviceDetail = lazy(() => import('./pages/DeviceDetail'));
const Impact = lazy(() => import('./pages/Impact'));
const Community = lazy(() => import('./pages/Community'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'));
const CommunitiesList = lazy(() => import('./pages/CommunitiesList'));
const CreateCommunity = lazy(() => import('./pages/CreateCommunity'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const RepairPage = lazy(() => import('./pages/RepairPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const BusinessExchange = lazy(() => import('./pages/BusinessExchange'));
const EcoImpact = lazy(() => import('./pages/EcoImpact'));
const EnhancedAdminDashboard = lazy(() => import('./pages/EnhancedAdminDashboard'));
const EnhancedOrganizationDashboard = lazy(() => import('./pages/EnhancedOrganizationDashboard'));
const ModeratorDashboard = lazy(() => import('./pages/ModeratorDashboard'));
const RecyclerDashboard = lazy(() => import('./pages/RecyclerDashboard'));
const EnhancedRepairDashboard = lazy(() => import('./pages/EnhancedRepairDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const EnhancedBusinessDashboard = lazy(() => import('./pages/EnhancedBusinessDashboard'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const RescueEngine = lazy(() => import('./pages/RescueEngine'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const RoleApplicationPage = lazy(() => import('./pages/RoleApplicationPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Guards a route to a specific set of allowed roles
function RoleRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <main className="pt-16 flex-1">
        <ErrorBoundary>
          <Suspense fallback={<LoadingState size="lg" fullPage />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Toaster position="top-center" />
          <EWasteChatbot />
          <Suspense fallback={<LoadingState size="lg" fullPage />}>
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<AppLayout><Home /></AppLayout>} />
              <Route path="/rescue" element={<AppLayout><RescueEngine /></AppLayout>} />
              <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
              <Route path="/privacy" element={<AppLayout><LegalPage initialTab="privacy" /></AppLayout>} />
              <Route path="/terms" element={<AppLayout><LegalPage initialTab="terms" /></AppLayout>} />
              <Route path="/contact" element={<AppLayout><LegalPage initialTab="contact" /></AppLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Community & Public Profiles */}
              <Route path="/community" element={<AppLayout><Community /></AppLayout>} />
              <Route path="/community/post/:id" element={<AppLayout><PostDetail /></AppLayout>} />
              <Route path="/community/:slug" element={<AppLayout><CommunityDetail /></AppLayout>} />
              <Route path="/communities" element={<AppLayout><CommunitiesList /></AppLayout>} />
              <Route path="/u/:username" element={<AppLayout><PublicProfile /></AppLayout>} />

              {/* Authenticated Community Action & Application pages */}
              <Route path="/apply" element={<ProtectedRoute><AppLayout><RoleApplicationPage /></AppLayout></ProtectedRoute>} />
              <Route path="/community/create-post" element={<ProtectedRoute><AppLayout><CreatePost /></AppLayout></ProtectedRoute>} />
              <Route path="/community/create" element={<ProtectedRoute><AppLayout><CreateCommunity /></AppLayout></ProtectedRoute>} />
              
              {/* Authenticated pages with workspace shell */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/devices/:id" element={<DeviceDetail />} />
                <Route path="/workspace/rescue" element={<RescueEngine />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/repair" element={<RepairPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/business" element={<BusinessExchange />} />
                <Route path="/eco-impact" element={<EcoImpact />} />
                <Route path="/reviews" element={<ReviewsPage />} />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />
                
                {/* Role-specific Consoles */}
                <Route path="/admin" element={<RoleRoute roles={['admin']}><EnhancedAdminDashboard /></RoleRoute>} />
                <Route path="/organization" element={<RoleRoute roles={['organization', 'admin']}><EnhancedOrganizationDashboard /></RoleRoute>} />
                <Route path="/moderator" element={<RoleRoute roles={['moderator', 'admin']}><ModeratorDashboard /></RoleRoute>} />
                <Route path="/recycler" element={<RoleRoute roles={['recycler', 'admin']}><RecyclerDashboard /></RoleRoute>} />
                <Route path="/repair-provider" element={<RoleRoute roles={['repair_provider', 'admin']}><EnhancedRepairDashboard /></RoleRoute>} />
                <Route path="/business-dashboard" element={<RoleRoute roles={['business', 'admin']}><EnhancedBusinessDashboard /></RoleRoute>} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
