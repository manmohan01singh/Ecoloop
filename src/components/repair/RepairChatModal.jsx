import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, MessageSquare, Loader2, User, Wrench, Clock, ShieldCheck
} from 'lucide-react';
import { getRepairMessages, sendRepairMessage } from '../../services/communityService';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';
import { Button, Modal, LoadingState, EmptyState } from '../ui';

export default function RepairChatModal({
  isOpen,
  onClose,
  request,
  providerId: targetProviderId
}) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const isOwner = user?.id === request?.userId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!request?.id) return;
    try {
      const params = {};
      if (isOwner && targetProviderId) {
        params.providerId = targetProviderId;
      }
      const res = await getRepairMessages(request.id, params);
      setMessages(res.data.data || []);
    } catch {
      // Silently catch error on refresh
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && request?.id) {
      setLoading(true);
      fetchMessages().then(scrollToBottom);
      const interval = setInterval(fetchMessages, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen, request?.id, targetProviderId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const payload = {
        message: text,
      };
      if (isOwner && targetProviderId) {
        payload.providerId = targetProviderId;
      }

      const res = await sendRepairMessage(request.id, payload);
      setMessages((prev) => [...prev, res.data.data]);
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send message');
      setInputText(text); // restore
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Direct Chat: ${request?.itemName || 'Repair Request'}`}
      size="md"
    >
      <div className="flex flex-col h-[460px]">
        {/* Ticket Header Banner */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Ticket #{request?.id?.slice(0, 8)}</span>
          <span className="font-semibold text-emerald-700 capitalize">
            Status: {request?.status?.replace('_', ' ')}
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {loading ? (
            <LoadingState size="md" message="Loading messages..." />
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <EmptyState
                icon={MessageSquare}
                title="No messages yet"
                description="Start a private conversation regarding symptoms, parts availability, or pickup coordination."
              />
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?.id;
              const sender = m.sender || {};

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-600">
                      {isMine ? (
                        'You'
                      ) : sender.username ? (
                        <Link
                          to={`/u/${sender.username}`}
                          className="hover:text-emerald-700 hover:underline"
                        >
                          {sender.name || `@${sender.username}`}
                        </Link>
                      ) : (
                        sender.name || 'Technician'
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={sending || !inputText.trim()}
            icon={sending ? Loader2 : Send}
          >
            Send
          </Button>
        </form>
      </div>
    </Modal>
  );
}
