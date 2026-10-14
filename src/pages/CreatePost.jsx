import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPost, getCommunities, uploadPostImages } from '../services/communityService';
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

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 10;

// One image slot — shows preview, progress bar, error, or remove button
function ImageSlot({ item, onRemove }) {
  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
      {/* Preview */}
      <img
        src={item.preview}
        alt={item.file.name}
        className={`w-full h-full object-cover transition-opacity ${item.status === 'uploading' ? 'opacity-50' : 'opacity-100'}`}
      />

      {/* Uploading overlay */}
      {item.status === 'uploading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <Loader2 className="w-6 h-6 text-white animate-spin mb-1" />
          <span className="text-xs text-white font-medium">{item.progress}%</span>
          <div className="w-3/4 h-1 bg-white/30 rounded-full mt-1">
            <div
              className="h-1 bg-emerald-400 rounded-full transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error overlay */}
      {item.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/70">
          <AlertCircle className="w-6 h-6 text-white mb-1" />
          <span className="text-xs text-white font-medium text-center px-1">{item.error}</span>
        </div>
      )}

      {/* Done badge */}
      {item.status === 'done' && (
        <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove image"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>

      {/* File name tooltip strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate">{item.file.name}</p>
      </div>
    </div>
  );
}

export default function CreatePost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // imageSlots: array of { id, file, preview, status: 'uploading'|'done'|'error', progress, url, error }
  const [imageSlots, setImageSlots] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general',
    communityId: '',
    flair: '',
  });

  useEffect(() => {
    getCommunities({ limit: 50 })
      .then(res => setCommunities(res.data.data.items))
      .catch(() => toast.error('Failed to load communities'));
  }, []);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => imageSlots.forEach(s => URL.revokeObjectURL(s.preview));
  }, []);

  const uploadFile = useCallback(async (slot) => {
    setImageSlots(prev => prev.map(s =>
      s.id === slot.id ? { ...s, status: 'uploading', progress: 0 } : s
    ));
    try {
      const res = await uploadPostImages([slot.file], (pct) => {
        setImageSlots(prev => prev.map(s =>
          s.id === slot.id ? { ...s, progress: pct } : s
        ));
      });
      const uploaded = res.data.data[0];
      setImageSlots(prev => prev.map(s =>
        s.id === slot.id ? { ...s, status: 'done', progress: 100, url: uploaded.url } : s
      ));
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Upload failed';
      setImageSlots(prev => prev.map(s =>
        s.id === slot.id ? { ...s, status: 'error', error: msg } : s
      ));
    }
  }, []);

  const addFiles = useCallback((files) => {
    const remaining = MAX_IMAGES - imageSlots.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const accepted = [];
    Array.from(files).slice(0, remaining).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: only images allowed`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: max size is ${MAX_SIZE_MB} MB`);
        return;
      }
      accepted.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading',
        progress: 0,
        url: null,
        error: null,
      });
    });

    if (!accepted.length) return;
    setImageSlots(prev => [...prev, ...accepted]);
    // Upload each immediately
    accepted.forEach(slot => uploadFile(slot));
  }, [imageSlots, uploadFile]);

  const removeSlot = useCallback((id) => {
    setImageSlots(prev => {
      const slot = prev.find(s => s.id === id);
      if (slot) URL.revokeObjectURL(slot.preview);
      return prev.filter(s => s.id !== id);
    });
  }, []);

  // Drag & drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { if (!dropZoneRef.current?.contains(e.relatedTarget)) setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // allow re-selecting same file
  };

  const isUploading = imageSlots.some(s => s.status === 'uploading');
  const uploadedUrls = imageSlots.filter(s => s.status === 'done').map(s => s.url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (isUploading) { toast.error('Please wait for images to finish uploading'); return; }

    const hasErrors = imageSlots.some(s => s.status === 'error');
    if (hasErrors) { toast.error('Remove failed images before posting'); return; }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        communityId: formData.communityId || null,
        images: uploadedUrls,
      };
      const res = await createPost(payload);
      toast.success('Post created!');
      navigate(`/community/post/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = formData.title.trim() && !isUploading && !loading;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Community */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Community <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={formData.communityId}
              onChange={e => setFormData(p => ({ ...p, communityId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <option value="">-- Post to general feed --</option>
              {communities.map(c => <option key={c.id} value={c.id}>c/{c.name}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="An engaging and descriptive title"
              maxLength={300}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.title.length}/300</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={formData.body}
              onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
              placeholder="Write your story, tips, question, or experience..."
              rows={6}
              maxLength={10000}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.body.length}/10,000</p>
          </div>

          {/* ── IMAGE UPLOAD ───────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images <span className="text-gray-400">(optional · up to {MAX_IMAGES} · max {MAX_SIZE_MB} MB each)</span>
            </label>

            <div className="space-y-3">
              {/* Preview grid */}
              {imageSlots.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {imageSlots.map(slot => (
                    <ImageSlot key={slot.id} item={slot} onRemove={removeSlot} />
                  ))}
                </div>
              )}

              {/* Drop zone — only shown when under the limit */}
              {imageSlots.length < MAX_IMAGES && (
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
                    ${isDragging
                      ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
                      : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <ImagePlus className={`w-6 h-6 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {isDragging ? 'Drop images here' : 'Click or drag & drop images'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPEG, PNG, GIF, WebP · up to {MAX_IMAGES - imageSlots.length} more
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />

              {/* Status summary */}
              {imageSlots.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  {isUploading && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading {imageSlots.filter(s => s.status === 'uploading').length} image(s)...
                    </span>
                  )}
                  {uploadedUrls.length > 0 && !isUploading && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {uploadedUrls.length} image(s) ready
                    </span>
                  )}
                  {imageSlots.some(s => s.status === 'error') && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {imageSlots.filter(s => s.status === 'error').length} failed — remove them to continue
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>

          {/* Flair */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flair <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.flair}
              onChange={e => setFormData(p => ({ ...p, flair: e.target.value }))}
              placeholder="e.g. Tips, Discussion, Question"
              maxLength={30}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Posting...' : isUploading ? 'Waiting for uploads...' : 'Create Post'}
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
