import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Phone, MapPin, Loader2 } from 'lucide-react';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: '', state: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/30 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">EcoLoop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Start tracking your devices</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-100/30 p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91..."
                  className="w-full pl-11 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="city" value={form.city} onChange={handleChange} placeholder="Delhi"
                  className="w-full pl-11 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
