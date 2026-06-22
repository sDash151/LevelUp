import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/design-system/components';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/shared/utils/api-client';

export function AICFOChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: "Hello! I'm your AI CFO. I have full context of your financial health, goals, and spending habits. What would you like to discuss today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/finance/ai/chat', { message: userMessage.content });
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: data.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: "⚠️ Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI CFO Chat" size="lg">
      <div className="flex flex-col h-[60vh]">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar space-y-4 mb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-sm' : 'border rounded-tl-sm'}`} style={msg.role === 'user' ? {} : { background: 'var(--th-card)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}>
                  {msg.role === 'ai' ? (
                    <div className="prose prose-sm prose-emerald max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-600">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl border rounded-tl-sm flex items-center gap-2 text-xs font-medium" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)', color: 'var(--th-primary)' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing finances...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="relative mt-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your spending, goals, or savings..."
            className="w-full pl-4 pr-12 py-4 border rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none transition-shadow"
            style={{ background: 'var(--th-card-solid)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Modal>
  );
}
