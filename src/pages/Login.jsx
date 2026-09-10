import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/30 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">EcoLoop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to track your devices</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-100/30 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@ecoloop.com" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo123" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-emerald-600 font-medium hover:underline">Sign up</Link>
        </p>

        <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 text-center">
          Demo: demo@ecoloop.com / demo123
        </div>
      </div>
    </div>
  );
}
