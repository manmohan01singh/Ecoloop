import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Phone, MapPin, Mail, Lock, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import useAuthStore from '../context/authStore';
import toast from 'react-hot-toast';
import { Button, Input, Badge } from '../components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: '', state: '', role: 'user' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getRoleDashboard = (role) => {
    const dashboards = {
      admin: '/admin',
      moderator: '/moderator',
      recycler: '/recycler',
      repair_provider: '/repair-provider',
      business: '/business-dashboard',
      organization: '/organization',
      user: '/dashboard'
    };
    return dashboards[role] || '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created successfully! Welcome to EcoLoop.');
      navigate(getRoleDashboard(form.role));
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column: Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 p-12 text-white relative overflow-hidden flex-col justify-between">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white font-display tracking-tight">EcoLoop</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <Badge variant="brand" size="md">CIVIC REGISTRATION</Badge>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight font-display tracking-tight text-white">
            Start saving devices and tracking real impact.
          </h2>
          <p className="text-gray-300 text-base leading-relaxed">
            Create your unified identity across Indonesia's electronic repair, trade-in, and certified recycling network.
          </p>

          <div className="space-y-3 pt-2 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full free access for households & students</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Earn EcoKarma badges for every device diverted from waste</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Dedicated portal matching your professional role</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500 pt-6 border-t border-gray-800/80 flex items-center justify-between">
          <span>© 2026 EcoLoop Platform</span>
          <span>Team Jai Mahakaal · Grand Finale</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          
          <div className="space-y-1">
            <div className="lg:hidden mb-6">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-gray-900 font-display">EcoLoop</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">Create Your Account</h1>
            <p className="text-sm text-gray-600">Join the nationwide circular electronics movement</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Raden Ayu"
              icon={<User className="w-4 h-4 text-gray-400" />}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="raden@example.com"
              icon={<Mail className="w-4 h-4 text-gray-400" />}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Jakarta / Bandung"
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
              />
              <Input
                label="Phone (WhatsApp)"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+62 812..."
                icon={<Phone className="w-4 h-4 text-gray-400" />}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Primary Role in Ecosystem *
              </label>
              <div className="relative">
                <select 
                  id="role"
                  name="role" 
                  value={form.role} 
                  onChange={handleChange} 
                  required
                  className="w-full px-3.5 py-2.5 min-h-[2.75rem] bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                >
                  <option value="user">Individual Citizen / Household</option>
                  <option value="repair_provider">Repair Shop / Technician</option>
                  <option value="recycler">Waste Bank / Certified Recycler</option>
                  <option value="business">Commercial Business / Enterprise</option>
                  <option value="organization">NGO / University / Organization</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                {form.role === 'user' && '✓ Track devices, list on marketplace, and join challenges'}
                {form.role === 'repair_provider' && '✓ Accept diagnostic requests and offer repair quotes'}
                {form.role === 'recycler' && '✓ Manage intake manifests and certify safe e-waste destruction'}
                {form.role === 'business' && '✓ Decommission commercial IT hardware and trade bulk surplus'}
                {form.role === 'organization' && '✓ Host community collection drives and track environmental metrics'}
              </p>
            </div>

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              icon={<Lock className="w-4 h-4 text-gray-400" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2 text-sm font-bold shadow-md shadow-emerald-600/20"
            >
              Create Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
