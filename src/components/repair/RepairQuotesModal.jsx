import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, CheckCircle2, Clock, ShieldCheck, DollarSign,
  AlertCircle, Send, Check, X, Star, FileText
} from 'lucide-react';
import {
  getRepairQuotes, submitRepairQuote, acceptRepairQuote
} from '../../services/communityService';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';
import { Button, Modal, LoadingState, EmptyState, Badge } from '../ui';

export default function RepairQuotesModal({
  isOpen,
  onClose,
  request,
  onQuoteAccepted,
  onOpenChat
}) {
  const { user } = useAuthStore();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitQuoteForm, setShowSubmitQuoteForm] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);

  // Quote form state for providers
  const [quoteForm, setQuoteForm] = useState({
    inspectionFee: 0,
    estimatedPriceMin: '',
    estimatedPriceMax: '',
    partsAssumptions: '',
    estimatedTime: '2-3 business days',
    warrantyTerms: '30-day parts & labor warranty',
    notes: '',
  });

  const isOwner = user?.id === request?.userId;
  const isProvider = user?.role === 'repair_provider' || user?.role === 'admin';

  const fetchQuotes = async () => {
    if (!request?.id) return;
    setLoading(true);
    try {
      const res = await getRepairQuotes(request.id);
      setQuotes(res.data.data || []);
    } catch {
      toast.error('Failed to load repair quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && request?.id) {
      fetchQuotes();
    }
  }, [isOpen, request?.id]);

  const handleAcceptQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to accept this repair quote? This will confirm the diagnostic and repair engagement.')) {
      return;
    }

    setAcceptingQuoteId(quoteId);
    try {
      await acceptRepairQuote(request.id, quoteId);
      toast.success('Quote accepted! The repair provider has been notified.');
      if (onQuoteAccepted) onQuoteAccepted();
      await fetchQuotes();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to accept quote');
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.estimatedPriceMin || !quoteForm.estimatedPriceMax) {
      toast.error('Please specify the estimated price range');
      return;
    }
    if (Number(quoteForm.estimatedPriceMin) > Number(quoteForm.estimatedPriceMax)) {
      toast.error('Minimum price cannot exceed maximum price');
      return;
    }

    setSubmittingQuote(true);
    try {
      await submitRepairQuote(request.id, {
        inspectionFee: Number(quoteForm.inspectionFee) || 0,
        estimatedPriceMin: Number(quoteForm.estimatedPriceMin),
        estimatedPriceMax: Number(quoteForm.estimatedPriceMax),
        partsAssumptions: quoteForm.partsAssumptions,
        estimatedTime: quoteForm.estimatedTime,
        warrantyTerms: quoteForm.warrantyTerms,
        notes: quoteForm.notes,
      });
      toast.success('Diagnostic quote submitted successfully!');
      setShowSubmitQuoteForm(false);
      await fetchQuotes();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quotes for "${request?.itemName || 'Repair Ticket'}"`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Ticket Summary Banner */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Ticket #{request?.id?.slice(0, 8)}</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{request?.itemName}</h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{request?.description}</p>
            </div>
            <Badge variant={request?.status === 'completed' ? 'success' : 'brand'}>
              {request?.status?.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Quotes List */}
        {loading ? (
          <LoadingState size="md" message="Loading quotes..." />
        ) : quotes.length === 0 ? (
          <div className="text-center py-8">
            <EmptyState
              icon={FileText}
              title="No quotes submitted yet"
              description={
                isProvider
                  ? "Be the first verified technician to quote on this customer's repair ticket."
                  : "Technicians in your area are evaluating your ticket. You will receive quotes here shortly."
              }
            />
            {isProvider && !showSubmitQuoteForm && (
              <div className="mt-4">
                <Button onClick={() => setShowSubmitQuoteForm(true)} icon={Wrench}>
                  Submit Quote Now
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Submitted Quotes ({quotes.length})
              </h4>
              {isProvider && !showSubmitQuoteForm && (
                <Button size="sm" variant="outline" onClick={() => setShowSubmitQuoteForm(true)} icon={Wrench}>
                  Update / Submit Quote
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {quotes.map((q) => {
                const isAccepted = q.status === 'accepted';
                const providerInfo = q.provider || {};

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border-2 transition-all ${
                      isAccepted
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          {providerInfo.user?.username ? (
                            <Link
                              to={`/u/${providerInfo.user.username}`}
                              className="font-bold text-slate-900 text-sm hover:text-emerald-700 hover:underline"
                            >
                              {providerInfo.businessName || providerInfo.user.name || 'Verified Workshop'}
                            </Link>
                          ) : (
                            <h5 className="font-bold text-slate-900 text-sm">
                              {providerInfo.businessName || 'Verified Workshop'}
                            </h5>
                          )}
                          {isAccepted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Accepted Quote
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {providerInfo.city || 'Local Workshop'} • {providerInfo.type || 'Technician'}
                        </p>
                      </div>

                      {/* Pricing block */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 font-display">
                          ${q.estimatedPriceMin} - ${q.estimatedPriceMax}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {q.inspectionFee > 0 ? `+ $${q.inspectionFee} diagnostic fee` : 'Free diagnostic'}
                        </p>
                      </div>
                    </div>

                    {/* Terms grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-1">
                      <div>
                        <span className="font-semibold text-slate-700">Turnaround:</span> {q.estimatedTime}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Warranty:</span> {q.warrantyTerms}
                      </div>
                      {q.partsAssumptions && (
                        <div className="col-span-2">
                          <span className="font-semibold text-slate-700">Parts:</span> {q.partsAssumptions}
                        </div>
                      )}
                      {q.notes && (
                        <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                          <span className="font-semibold text-slate-700">Technician Note:</span> {q.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onClose();
                          if (onOpenChat) onOpenChat(q.providerId);
                        }}
                      >
                        Message Technician
                      </Button>

                      {isOwner && request?.status !== 'completed' && !isAccepted && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptQuote(q.id)}
                          disabled={acceptingQuoteId === q.id}
                        >
                          {acceptingQuoteId === q.id ? 'Accepting...' : 'Accept Quote'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Provider Quote Submission Form */}
        {isProvider && showSubmitQuoteForm && (
          <form onSubmit={handleSubmitQuote} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-600" />
                Submit Structured Repair Quote
              </h4>
              <button
                type="button"
                onClick={() => setShowSubmitQuoteForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inspection Fee ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quoteForm.inspectionFee}
                  onChange={(e) => setQuoteForm({ ...quoteForm, inspectionFee: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Min ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quoteForm.estimatedPriceMin}
                  onChange={(e) => setQuoteForm({ ...quoteForm, estimatedPriceMin: e.target.value })}
                  placeholder="e.g. 45"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Max ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quoteForm.estimatedPriceMax}
                  onChange={(e) => setQuoteForm({ ...quoteForm, estimatedPriceMax: e.target.value })}
                  placeholder="e.g. 75"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Turnaround
                </label>
                <input
                  type="text"
                  value={quoteForm.estimatedTime}
                  onChange={(e) => setQuoteForm({ ...quoteForm, estimatedTime: e.target.value })}
                  placeholder="e.g. 1-2 business days"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Warranty Guarantee
                </label>
                <input
                  type="text"
                  value={quoteForm.warrantyTerms}
                  onChange={(e) => setQuoteForm({ ...quoteForm, warrantyTerms: e.target.value })}
                  placeholder="e.g. 90-day parts and labor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parts & Replacement Assumptions
              </label>
              <input
                type="text"
                value={quoteForm.partsAssumptions}
                onChange={(e) => setQuoteForm({ ...quoteForm, partsAssumptions: e.target.value })}
                placeholder="e.g. Assumes OEM display replacement; motherboard trace intact"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technician Diagnosis Notes
              </label>
              <textarea
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                rows={2}
                placeholder="Explain the repair approach, testing procedures, or advice..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowSubmitQuoteForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingQuote}
              >
                {submittingQuote ? 'Submitting...' : 'Send Quote to Customer'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
