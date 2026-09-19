import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import Impact from './pages/Impact';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import CommunityDetail from './pages/CommunityDetail';
import CommunitiesList from './pages/CommunitiesList';
import CreateCommunity from './pages/CreateCommunity';
import Marketplace from './pages/Marketplace';
import ChallengesPage from './pages/ChallengesPage';
import EventsPage from './pages/EventsPage';
import MapPage from './pages/MapPage';
import RepairPage from './pages/RepairPage';
import ReportsPage from './pages/ReportsPage';
import BusinessExchange from './pages/BusinessExchange';
import EcoImpact from './pages/EcoImpact';
import EnhancedAdminDashboard from './pages/EnhancedAdminDashboard';
import OrganizationDashboard from './pages/OrganizationDashboard';
import useAuthStore from './context/authStore';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <LanguageSwitcher />
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Authenticated pages with sidebar */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/devices/:id" element={<DeviceDetail />} />
            <Route path="/impact" element={<Impact />} />
            
            {/* Community Features */}
            <Route path="/community" element={<Community />} />
            <Route path="/community/create-post" element={<CreatePost />} />
            <Route path="/community/create" element={<CreateCommunity />} />
            <Route path="/community/post/:id" element={<PostDetail />} />
            <Route path="/community/:slug" element={<CommunityDetail />} />
            <Route path="/communities" element={<CommunitiesList />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/repair" element={<RepairPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/business" element={<BusinessExchange />} />
            <Route path="/eco-impact" element={<EcoImpact />} />
            
            {/* Role-specific Dashboards */}
            <Route path="/admin" element={<EnhancedAdminDashboard />} />
            <Route path="/organization" element={<OrganizationDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
