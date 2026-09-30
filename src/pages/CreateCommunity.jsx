import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Globe } from 'lucide-react';
import { createCommunity } from '../services/communityService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'recycling', label: 'Recycling' },
  { value: 'repair', label: 'Repair' },
  { value: 'reuse', label: 'Reuse' },
  { value: 'ewaste', label: 'E-Waste' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'textile', label: 'Textile' },
  { value: 'food_organic', label: 'Food / Organic' },
  { value: 'construction', label: 'Construction' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'waste_problems', label: 'Waste Problems' },
  { value: 'circular_business', label: 'Circular Business' },
  { value: 'general', label: 'General' },
];

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Community name is required');
      return;
    }

    if (formData.name.length < 3 || formData.name.length > 50) {
      toast.error('Name must be between 3–50 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_ ]+$/.test(formData.name)) {
      toast.error('Name can only contain letters, numbers, spaces, and underscores');
      return;
    }

    setLoading(true);
    try {
      const res = await createCommunity(formData);
      toast.success('Community created!');
      const slug = res.data.data.slug;
      navigate(`/community/${slug}`);
    } catch (err) {
      const message = err.response?.data?.error?.message;
      if (message?.includes('taken')) {
        toast.error('Community name is already taken');
      } else {
        toast.error(message || 'Failed to create community');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Community</h1>
        <p className="text-sm text-gray-500 mb-6">
          Build a discussion space for a circular economy topic you care about
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Zero Waste Indonesia"
              maxLength={50}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/50 characters • Letters, numbers, spaces, and underscores only
            </p>
            {formData.name && (
              <p className="text-xs text-emerald-600 mt-1">
                URL: c/{formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 100)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell people what this community is about..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the most relevant category</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Community Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: false })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-sm text-gray-500">Anyone can view and join</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  checked={formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: true })}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Private</span>
                  </div>
                  <p className="text-sm text-gray-500">Only approved members can see content</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📌 Tips for a great community</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Choose a clear and memorable name</li>
              <li>Write an informative description</li>
              <li>Set community rules after creation</li>
              <li>Invite members relevant to the topic</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Community'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
