import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

export default function TestRepairDashboard() {
  const { user } = useAuthStore();

  if (!['repair_provider', 'admin'].includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Repair Provider Dashboard</h1>
      <p className="mt-4">Welcome, {user?.name}!</p>
      <p className="mt-2">This is a test page to verify routing works.</p>
      <div className="mt-6 p-4 bg-blue-100 rounded">
        <p className="font-semibold">If you can see this, the routing is working!</p>
        <p className="mt-2">User Role: {user?.role}</p>
        <p>User Email: {user?.email}</p>
      </div>
    </div>
  );
}
