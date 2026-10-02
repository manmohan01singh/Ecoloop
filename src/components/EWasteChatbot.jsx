import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Minimize2, ExternalLink } from 'lucide-react';

const CHATBOT_URL = 'https://chatbot.getmindpal.com/e-waste-management-ai-assistant-kdd';

export default function EWasteChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasOpened, setHasOpened] = useState(false); // keep iframe mounted after first open
  const iframeRef = useRef(null);

  const open = () => {
    setIsOpen(true);
    setHasOpened(true);
  };

  const close = () => setIsOpen(false);

  const toggle = () => (isOpen ? close() : open());

  // Focus iframe when opened for accessibility
  useEffect(() => {
    if (isOpen && iframeRef.current && isLoaded) {
      iframeRef.current.focus();
    }
  }, [isOpen, isLoaded]);

  return (
    <>
      {/* ── Chat window ─────────────────────────────────────── */}
      <div
        aria-label="E-Waste AI Assistant"
        className={`fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white transition-all duration-300 origin-bottom-right
          ${isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
          }`}
        style={{ width: 'min(420px, calc(100vw - 48px))', height: 'min(600px, calc(100vh - 120px))' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg leading-none">♻️</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">E-Waste AI Assistant</p>
            <p className="text-xs text-emerald-100">Ask about recycling, repair & disposal</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={CHATBOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={close}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={close}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iframe — mounted once and kept in DOM so chat history persists */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {/* Spinner shown until iframe loads */}
          {!isLoaded && hasOpened && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
              <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading AI assistant...</p>
            </div>
          )}
          {hasOpened && (
            <>
              <iframe
                ref={iframeRef}
                src={CHATBOT_URL}
                title="E-Waste Management AI Assistant"
                className="w-full border-0"
                style={{ height: 'calc(100% + 40px)', marginBottom: '-40px' }}
                allow="microphone; clipboard-write"
                onLoad={() => setIsLoaded(true)}
              />
              {/* White padding overlay to hide "Powered by MindPal" only */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white pointer-events-none z-20" />
            </>
          )}
        </div>
      </div>

      {/* ── Toggle button ───────────────────────────────────── */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close AI assistant' : 'Open E-Waste AI Assistant'}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-2xl shadow-lg font-medium text-sm transition-all duration-300
          ${isOpen
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5'
          }`}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <span>Close AI</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            <span>E-Waste AI</span>
            {/* Pulse ring to draw attention */}
            <span className="absolute -top-1 -right-1 w-3 h-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </>
        )}
      </button>
    </>
  );
}
